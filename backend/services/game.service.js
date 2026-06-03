import { Game } from "../models/game.model.js";
import { User } from "../models/user.model.js";
import { getIO } from "../socket/game.socket.js";
import {
    rollDice,
    rollDie,
    idsEqual,
    getActivePlayerIds,
    moveToNextActivePlayer,
    getPlayerStack,
    getContribution,
    pushBetLog,
    splitPot,
    bettingRoundIsComplete,
    getCurrentRoundResult,
    resolveRound,
    turnHasExpired,
    startTurnTimer,
    sanitizeGameForViewer
} from "../utils/gameHelpers.js";
import { calculatePairwiseEloUpdates, getEloField } from "../utils/elo.js";
import { ROUND_END_DELAY_MS, MAX_ROLLS_PER_TURN } from "../config/constants.js";

async function getPopulatedGameState(gid) {
    return await Game.findById(gid)
        .populate("players", "username")
        .populate("result.winner", "username");
}

async function emitPersonalizedState(gid, game) {
    const io = getIO();
    if (!io) return;

    const populatedGames = await getPopulatedGameState(gid) || game;
    const sockets = await io.in(gid.toString()).fetchSockets();

    for (const s of sockets) {
        s.emit("game-state", sanitizeGameForViewer(populatedGames, s.user?.id));
    }
}

function emitLobbyUpdate() {
    getIO()?.emit("lobby-update");
}

export async function getAllGames({ skip = 0, limit = 20, filter = {}, requestingUser = null, mine = false } = {}) {
    const query = { ...filter };

    if (mine && requestingUser?.id) {
        query.players = requestingUser.id;
        if (!query.status) query.status = { $in: ["waiting", "ongoing"] };
    } else if (requestingUser?.id) {
        query.players = { $ne: requestingUser.id };

        if (requestingUser.type === "user" && query.status === "waiting") {
            const user = await User.findById(requestingUser.id);
            if (user) {
                query.$or = [
                    { desiredElo: { $exists: false } },
                    {
                        $and: [
                            { desiredElo: { $lte: user.elo + 200 } },
                            { desiredElo: { $gte: user.elo - 200 } }
                        ]
                    }
                ];
            }
        }
    } else if (query.status === "waiting") {
        query.allowAnonymous = true;
    }

    return await Game.find(query)
        .skip(skip)
        .limit(limit)
        .populate("players", "username elo elo10s elo30s elo90s profileImage")
        .populate("result.winner", "username");
}

export async function getTopGames() {
    let ongoingGames = await Game.find({ status: "ongoing" })
        .populate("players", "username elo elo10s elo30s elo90s profileImage");

    ongoingGames.sort((a, b) => {
        const avgA = a.players.reduce((sum, p) => sum + (p.elo || 1000), 0) / (a.players.length || 1);
        const avgB = b.players.reduce((sum, p) => sum + (p.elo || 1000), 0) / (b.players.length || 1);
        return avgB - avgA;
    });

    let result = ongoingGames.slice(0, 5);

    if (result.length < 5) {
        const needed = 5 - result.length;
        const finishedGames = await Game.find({ status: "finished" })
            .sort({ createdAt: -1 }) 
            .limit(needed)
            .populate("players", "username elo elo10s elo30s elo90s profileImage")
            .populate("result.winner", "username");

        result = [...result, ...finishedGames];
    }

    return result;
}

export async function getGame(gid) {
    return await Game.findById(gid)
        .populate("players", "username elo elo10s elo30s elo90s profileImage")
        .populate("result.winner", "username");
}

export async function joinGame(gid, playerId, requestingUser = null) {
    const game = await Game.findById(gid);
    if (!game) return null;

    const startingStack = game.buyIn * game.variant.rounds;

    if (game.players.some(player => idsEqual(player, playerId))) {
        return await Game.findById(gid)
            .populate("players", "username elo elo10s elo30s elo90s profileImage")
            .populate("result.winner", "username");
    }

    if (requestingUser?.type === "anonymous" && !game.allowAnonymous) {
        throw new Error("This game does not allow anonymous players");
    }

    if (playerId) {
        const activeGame = await Game.findOne({
            players: playerId,
            status: { $in: ["waiting", "ongoing"] },
            _id: { $ne: gid }
        });
        if (activeGame) throw new Error("You are already in an active game");
    }

    const user = await User.findById(playerId);
    if (!user) throw new Error("User not found");

    if (user.points < startingStack) {
        throw new Error("You do not have enough points to join this game");
    }

    await User.findByIdAndUpdate(playerId, { $inc: { points: -startingStack } });
    await Game.findByIdAndUpdate(gid, {
        $addToSet: { players: playerId },
        $push: { playerStacks: { user: playerId, stack: startingStack } }
    });

    const updated = await Game
        .findById(gid)
        .populate("players", "username elo elo10s elo30s elo90s profileImage")
        .populate("result.winner", "username");

    if (updated && updated.players.length >= updated.numPlayers && updated.status === "waiting") {
        updated.status = "ongoing"; 
        updated.phase = "rolling"; 
        updated.currentRound = 1;
        updated.currentTurn = updated.players[0]._id || updated.players[0];
        updated.timeoutState = {
            turnStartedAt: new Date(),
            turnExpiresAt: new Date(Date.now() + updated.variant.timeControl * 1000),
            timedOutUser: null,
            timeoutCount: 0
        };
        await updated.save();
    }

    if (updated) {
        await emitPersonalizedState(gid, updated);
        emitLobbyUpdate();
    }

    return updated;
}

export async function createGame(data) {
    const buyIn = data.buyIn ?? 1;
    const startingStack = buyIn * data.variant.rounds;
    const playerStacks = (data.players || []).map(playerId => ({ user: playerId, stack: startingStack }));

    for (const playerId of data.players || []) {
        if (startingStack > 0) {
            const user = await User.findById(playerId);
            if (!user) throw new Error("User not found");
            if (user.points < startingStack) throw new Error("You do not have enough points to create this game");
            await User.findByIdAndUpdate(playerId, { $inc: { points: -startingStack } });
        }
    }

    const game = await Game.create({ ...data, playerStacks });
    emitLobbyUpdate();
    return game;
}

export async function leaveGame(gid, playerId) {
    const game = await Game.findById(gid);
    if (!game) return null;
    if (game.status === "finished") throw new Error("Cannot leave a finished game");

    const isInGame = game.players.some(p => p.toString() === playerId.toString());
    if (!isInGame) throw new Error("You are not in this game");

    if (game.status === "waiting") {
        const startingStack = game.buyIn * game.variant.rounds;
        await Promise.all([  
            User.findByIdAndUpdate(playerId, { $inc: { points: startingStack } }),
            Game.findByIdAndUpdate(gid, {
                $pull: { players: playerId, playerStacks: { user: playerId } }
            })
        ]);
        const updated = await Game.findById(gid)
            .populate("players", "username elo elo10s elo30s elo90s profileImage")
            .populate("result.winner", "username");
        if (updated.players.length === 0) {
            await Game.findByIdAndDelete(gid);
            emitLobbyUpdate();
            getIO()?.to(gid.toString()).emit("game-deleted", { gid });
            return { deleted: true };
        }
        emitLobbyUpdate();
        await emitPersonalizedState(gid, updated);
        return updated;
    }

    const remainingPlayers = game.players.filter(p => !idsEqual(p, playerId));

    const forfeiterStack = getPlayerStack(game, playerId);
    if (forfeiterStack) {
        game.pot += forfeiterStack.stack;
        forfeiterStack.stack = 0;
    }
    if (game.pot > 0 && remainingPlayers.length > 0) {
        splitPot(game, remainingPlayers);
    }
    await game.save();

    if (remainingPlayers.length === 0) {
        return await updateGame(gid, {
            status: "finished",
            result: { scores: [] }
        });
    }

    const forfeitScores = game.players.map(player => ({
        player,
        score: remainingPlayers.some(remainingPlayer => idsEqual(remainingPlayer, player)) ? 1 : 0
    }));

    const result = {
        scores: forfeitScores
    };

    if (remainingPlayers.length === 1) {
        result.winner = remainingPlayers[0];
    }

    return await updateGame(gid, {
        status: "finished",
        result
    });
}

export async function updateGame(gid, data) {
    const oldGame = await Game.findById(gid);
    if (!oldGame) return null;

    const updateData = { ...data };
    
    if (updateData.status === "finished"){
        updateData.phase = "finished";

        if (!updateData.result) {
            updateData.result = {};
        }

        const oldGameWithStacks = oldGame;
        if (!updateData.result.scores) {
            updateData.result.scores = oldGameWithStacks.playerStacks.map(entry => ({
                player: entry.user,
                score: entry.stack
            }));
        }

        if(!updateData.result.winner && updateData.result.scores.length > 0) {
            const topScore = Math.max(...updateData.result.scores.map(score => score.score));
            const winners = updateData.result.scores.filter(score => score.score === topScore);

            if (winners.length === 1) {
                updateData.result.winner = winners[0].player;
            }
        }
    }

    const game = await Game.findByIdAndUpdate(gid, updateData, { returnDocument: "after" });

    if (!game.isAnonymous && oldGame.status !== "finished" && game.status === "finished" && game.result?.scores?.length) {
        const players = await User.find({ _id: { $in: game.players } });
        const eloField = getEloField(game.variant.timeControl);

        const scoreByPlayerId = new Map(
            (game.result?.scores || []).map(score => [
                score.player.toString(),
                score.score
            ])
        );

        const eloUpdates = calculatePairwiseEloUpdates(players, scoreByPlayerId, eloField);

        for (const update of eloUpdates) {
            const generalElo = Math.max(0, (update.player.elo || 1000) + update.delta);
            const playerWon = game.result?.winner?.toString() === update.playerId;

            await User.findByIdAndUpdate(update.playerId, {
                $set: {
                    [eloField]: update.newRating,
                    elo: generalElo
                },
                $inc: {
                    gamesPlayed: 1,
                    wins: playerWon ? 1 : 0
                },
                $push: {
                    eloHistory: {
                        elo: generalElo,
                        date: new Date()
                    }
                }
            });
        }

        for (const entry of game.playerStacks) {
            if (entry.stack > 0) {
                await User.findByIdAndUpdate(entry.user, {
                    $inc: { points: entry.stack }
                });
            }
        }
    }

    if (!oldGame.isAnonymous && oldGame.status !== "finished" && game.status === "finished") {
        getIO()?.to(gid.toString()).emit("game-end", { winner: game.result?.winner });
        const populated = await Game.findById(gid).populate("result.winner", "username");
        if (populated) await emitPersonalizedState(gid, populated);
    }

    return game;
}

async function advanceAfterRound(gid, completedRound) {
    await new Promise(resolve => setTimeout(resolve, ROUND_END_DELAY_MS));

    const game = await Game.findById(gid);
    if (!game || game.phase !== "round-ended" || game.currentRound !== completedRound) return;

    if (completedRound >= game.variant.rounds) {
        await updateGame(gid, { status: "finished" });
    } else {
        game.currentRound += 1;
        game.phase = "rolling";
        game.foldedUsers = [];
        game.bettingState = { currentBet: 0, contributions: [], actedUsers: [], lastAggressor: null };
        startTurnTimer(game, game.players[0]);
        await game.save();
        await emitPersonalizedState(gid, game);
    }
}

function enterBettingPhase(game, activePlayers) {
    game.phase = "betting";

    game.bettingState = {
        currentBet: 0,
        contributions: [],
        actedUsers: [],
        lastAggressor: null
    };

    startTurnTimer(game, activePlayers[0]);
}

export async function rollForPlayer(gid, playerId, heldIndexes = []) {
    const game = await Game.findById(gid);
    if (!game) return null;

    if (game.status !== "ongoing" || game.phase !== "rolling") {
        throw new Error("This game is not currently rolling");
    }

    const isPlayer = game.players.some(
        player => player.toString() === playerId.toString()
    );

    if (!isPlayer) {
        throw new Error("You are not a player in this game");
    }

    if (game.currentTurn?.toString() !== playerId.toString()) {
        throw new Error("It is not your turn");
    }

    if (turnHasExpired(game)) {
        throw new Error("Your turn has expired");
    }

    const round = game.currentRound || 1;

    const existingResult = game.results.find(result =>
        result.player?.toString() === playerId.toString() &&
        result.round === round
    );

    if (existingResult && existingResult.rollCount >= MAX_ROLLS_PER_TURN) {
        throw new Error("You have used all your rolls this turn");
    }

    if (existingResult) {
        existingResult.hiddenRolls = existingResult.hiddenRolls.map((val, i) =>
            heldIndexes.includes(i) ? val : rollDie()
        );
        existingResult.holds = existingResult.hiddenRolls.map((_, i) => heldIndexes.includes(i));
        existingResult.rollCount += 1;
    } else {
        const rolls = rollDice();
        game.results.push({
            player: playerId,
            round,
            hiddenRolls: rolls,
            revealedRolls: [],
            rolls,
            holds: [false, false, false, false, false],
            rollCount: 1,
            timestamps: { startedAt: new Date() }
        });
    }

    const activePlayers = getActivePlayerIds(game);
    const currentResult = game.results.find(r =>
        r.player?.toString() === playerId.toString() && r.round === round
    );

    const everyoneFinished = activePlayers.every(activePlayerId => {
        const r = game.results.find(res => idsEqual(res.player, activePlayerId) && res.round === round);
        return r && r.rollCount >= MAX_ROLLS_PER_TURN;
    });

    if (everyoneFinished) {
        enterBettingPhase(game, activePlayers);
    } else if (currentResult.rollCount >= MAX_ROLLS_PER_TURN) {
        moveToNextActivePlayer(game);
    }

    await game.save();
    await emitPersonalizedState(gid, game);

    if (everyoneFinished) {
        getIO()?.to(gid.toString()).emit("round-start", { round: game.currentRound });
    }

    return game;
}

export async function placeBet(gid, playerId, { action, amount = 0 }) {
    const game = await Game.findById(gid);
    if (!game) return null;

    if (game.status !== "ongoing" || game.phase !== "betting") {
        throw new Error("This game is not currently accepting bets");
    }

    if (!game.players.some(id => idsEqual(id, playerId))) {
        throw new Error("You are not a player in this game");
    }

    if (game.foldedUsers.some(id => idsEqual(id, playerId))) {
        throw new Error("You have already folded");
    }

    if (!idsEqual(game.currentTurn, playerId)) {
        throw new Error("It is not your turn");
    }

    if (turnHasExpired(game)) {
        throw new Error("Your turn has expired");
    }

    const stackEntry = getPlayerStack(game, playerId);
    if (!stackEntry) throw new Error("Player stack not found");

    const contribution = getContribution(game, playerId);
    const currentBet = game.bettingState.currentBet;
    const amountNeededToMatch = currentBet - contribution.amount;
    const roundBetCap = game.buyIn;

    if (action === "fold") {
        if(!game.foldedUsers.some(id => idsEqual(id, playerId))) {
            game.foldedUsers.push(playerId);
        }
        pushBetLog(game, playerId, "fold", 0);
    } else if (action === "check") {
        if (currentBet > 0) {
            throw new Error("Cannot check when there is an active bet, use match or fold");
        }
        if (!game.bettingState.actedUsers.some(id => idsEqual(id, playerId))) {
            game.bettingState.actedUsers.push(playerId);
        }
        pushBetLog(game, playerId, "check", 0);
    } else if (action === "bet") {
        if (currentBet > 0) {
            throw new Error("Cannot bet because a bet already exists; use raise or match");
        }
        if (amount <= 0) {
            throw new Error(`Bet amount must be a number greater than 0`);
        }
        if (amount > roundBetCap) {
            throw new Error(`Bet cannot be higher than ${roundBetCap} points per round`);
        }
        if (stackEntry.stack < amount) {
            throw new Error("Not enough points in stack");
        }

        stackEntry.stack -= amount;
        contribution.amount += amount;
        game.pot += amount;

        game.bettingState.currentBet = contribution.amount;
        game.bettingState.lastAggressor = playerId;
        game.bettingState.actedUsers = [playerId];

        pushBetLog(game, playerId, "bet", amount);
    } else if (action === "match") {
        if (amountNeededToMatch <= 0) {
            if (!game.bettingState.actedUsers.some(id => idsEqual(id, playerId))) {
                game.bettingState.actedUsers.push(playerId);
            }

            pushBetLog(game, playerId, "match", 0);
        } else {
            if (stackEntry.stack < amountNeededToMatch) {
                throw new Error("Not enough points in stack");
            }

            stackEntry.stack -= amountNeededToMatch;
            contribution.amount += amountNeededToMatch;
            game.pot += amountNeededToMatch;

            if(!game.bettingState.actedUsers.some(id => idsEqual(id, playerId))) {
                game.bettingState.actedUsers.push(playerId);
            }
            pushBetLog(game, playerId, "match", amountNeededToMatch);
        }
    } else if (action === "raise") {
        if (amount <= amountNeededToMatch) {
            throw new Error("Raise must be greater than the amount needed to match");
        }
        if (contribution.amount + amount > roundBetCap) {
            throw new Error(`Total bet cannot be higher than ${roundBetCap} points per round`);
        }
        if (stackEntry.stack < amount) {
            throw new Error("Not enough points in stack");
        }

        stackEntry.stack -= amount;
        contribution.amount += amount;
        game.pot += amount;

        game.bettingState.currentBet = contribution.amount;
        game.bettingState.lastAggressor = playerId;
        game.bettingState.actedUsers = [playerId];

        pushBetLog(game, playerId, "raise", amount);
    } else {
        throw new Error("Invalid betting action");
    }

    const activePlayers = getActivePlayerIds(game);

    if (activePlayers.length === 1) {
        splitPot(game, [activePlayers[0]]);

        game.phase = "round-ended";
        game.currentTurn = null;

        const result = getCurrentRoundResult(game, activePlayers[0]);

        if (result) {
            result.outcome = activePlayers[0];
            result.timestamps.endedAt = new Date();
        } else {
            game.results.push({
                player: activePlayers[0],
                round: game.currentRound,
                hiddenRolls: [],
                revealedRolls: [],
                rolls: [],
                holds: [false, false, false, false, false],
                rollCount: 0,
                bets: [],
                outcome: activePlayers[0],
                timestamps: {
                    startedAt: new Date(),
                    endedAt: new Date()
                }
            });
        }

    } else if (bettingRoundIsComplete(game)) {
        resolveRound(game);
    } else {
        moveToNextActivePlayer(game);
    }

    game.markModified("bettingState");
    await game.save();
    await emitPersonalizedState(gid, game);

    if (game.phase === "round-ended") {
        getIO()?.to(gid.toString()).emit("round-end", { round: game.currentRound });
        advanceAfterRound(gid, game.currentRound);
    }

    return game;
}

export async function handleTimeout(gid) {
    const game = await Game.findById(gid);
    if(!game) return null;

    if (game.status !== "ongoing") {
        throw new Error("Only ongoing games can time out");
    }

    if (!game.currentTurn) {
        throw new Error("No active turn to time out");
    }

    if (!turnHasExpired(game)) {
        throw new Error("Current turn has not expired yet");
    }

    const timedOutPlayerId = game.currentTurn;

    game.timeoutState.timedOutUser = timedOutPlayerId;
    game.timeoutState.timeoutCount = (game.timeoutState.timeoutCount || 0) + 1;

    if (game.phase === "rolling") {
        const round = game.currentRound || 1;

        const alreadyRolledThisRound = game.results.some(result =>
            idsEqual(result.player, timedOutPlayerId) && result.round === round);

        if (!alreadyRolledThisRound) {
            const rolls = rollDice();

            game.results.push({
                player: timedOutPlayerId,
                round,
                hiddenRolls: rolls,
                revealedRolls: [],
                rolls,
                holds: [false, false, false, false, false],
                rollCount: MAX_ROLLS_PER_TURN,
                bets: [{
                    user: timedOutPlayerId,
                    action: "timeout",
                    amount: 0,
                    createdAt: new Date()
                }],
                timestamps: {
                    startedAt: new Date()
                }
            });
        } else { 
            const timedOutResult = game.results.find(result =>
                idsEqual(result.player, timedOutPlayerId) && result.round === round
            );
            if (timedOutResult) timedOutResult.rollCount = MAX_ROLLS_PER_TURN;
        }

        const activePlayers = getActivePlayerIds(game);

        const everyoneFinished = activePlayers.every(activePlayerId => {
            const playerResult = game.results.find(result =>
                idsEqual(result.player, activePlayerId) && result.round === round
            );
            return playerResult && playerResult.rollCount >= MAX_ROLLS_PER_TURN;
        });

        if (everyoneFinished) {
            enterBettingPhase(game, activePlayers);
        } else {
            moveToNextActivePlayer(game);
        }
    } else if (game.phase === "betting") {
        const stackEntry = getPlayerStack(game, timedOutPlayerId);
        if (!stackEntry) throw new Error("Player stack not found");

        const contribution = getContribution(game, timedOutPlayerId);
        const amountNeededToMatch = game.bettingState.currentBet - contribution.amount;

        if (amountNeededToMatch > 0) {
            if (stackEntry.stack < amountNeededToMatch) {
                if (!game.foldedUsers.some(id => idsEqual(id, timedOutPlayerId))) {
                    game.foldedUsers.push(timedOutPlayerId);
                }

                pushBetLog(game, timedOutPlayerId, "timeout", 0);
                pushBetLog(game, timedOutPlayerId, "fold", 0);
            } else {
                stackEntry.stack -= amountNeededToMatch;
                contribution.amount += amountNeededToMatch;
                game.pot += amountNeededToMatch;

                pushBetLog(game, timedOutPlayerId, "timeout", amountNeededToMatch);
                pushBetLog(game, timedOutPlayerId, "match", amountNeededToMatch);

                if (!game.bettingState.actedUsers.some(id => idsEqual(id, timedOutPlayerId))) {
                    game.bettingState.actedUsers.push(timedOutPlayerId);
                }
            }
        } else {
            pushBetLog(game, timedOutPlayerId, "timeout", 0);
            pushBetLog(game, timedOutPlayerId, "match", 0);

            if (!game.bettingState.actedUsers.some(id => idsEqual(id, timedOutPlayerId))) {
                game.bettingState.actedUsers.push(timedOutPlayerId);
            }
        }

        const activePlayers = getActivePlayerIds(game);

        if (activePlayers.length === 1) {
            splitPot(game, [activePlayers[0]]);

            game.phase = "round-ended";
            game.currentTurn = null;

            const result = getCurrentRoundResult(game, activePlayers[0]);

            if (result) {
                result.outcome = activePlayers[0];
                result.timestamps.endedAt = new Date();
            }
        } else if (bettingRoundIsComplete(game)) {
            resolveRound(game);
        } else {
            moveToNextActivePlayer(game);
        }
    } else {
        throw new Error("Current phase cannot time out");
    }

    await game.save();

    getIO()?.to(gid.toString()).emit("timeout", {
        user: timedOutPlayerId,
        phase: game.phase,
        round: game.currentRound
    });

    await emitPersonalizedState(gid, game);

    if (game.phase === "round-ended") {
        advanceAfterRound(gid, game.currentRound);
    }

    return game;
}

export default {
    getAllGames,
    getTopGames,
    getGame,
    joinGame,
    createGame,
    updateGame,
    leaveGame,
    rollForPlayer,
    sanitizeGameForViewer,
    placeBet,
    handleTimeout
};
