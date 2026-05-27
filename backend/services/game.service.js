import { Game } from "../models/game.model.js";
import { User } from "../models/user.model.js";
import { getIO } from "../socket/game.socket.js";
import {
    rollDice,
    idsEqual,
    getActivePlayerIds,
    moveToNextActivePlayer,
    getPlayerStack,
    getContribution,
    pushBetLog,
    rollsArePublic,
    splitPot,
    bettingRoundIsComplete,
    getCurrentRoundResult,
    resolveRound,
    turnHasExpired,
    startTurnTimer
} from "../utils/gameHelpers.js";

// K-factor determines how much ELO changes per game (32 is standard for beginners)
const K = 32;

// Calculates new ELO ratings for two players after a game
function calculateElo(players, winnerId, timeControl = 10) {
    const [playerA, playerB] = players;

    // Determine which Elo rating to use as base (defaulting to 1000 if not set)
    let eloField = "elo";
    if (timeControl === 10) eloField = "elo10s";
    else if (timeControl === 30) eloField = "elo30s";
    else if (timeControl === 90) eloField = "elo90s";

    const ratingA = playerA[eloField] || 1000;
    const ratingB = playerB[eloField] || 1000;

    // Expected scores based on current ratings (probability of winning)
    const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    const expectedB = 1 / (1 + Math.pow(10, (ratingA - ratingB) / 400));

    // Check who won
    const playerAWon = playerA._id.equals(winnerId);

    return {
        newEloA: Math.round(ratingA + K * ((playerAWon ? 1 : 0) - expectedA)),
        newEloB: Math.round(ratingB + K * ((playerAWon ? 0 : 1) - expectedB)),
        eloField
    };
}

// Returns all games from the database, supports pagination and advanced filtering
// mine=true returns only the requesting user's own active games (waiting/ongoing)
export async function getAllGames({ skip = 0, limit = 20, filter = {}, requestingUser = null, mine = false } = {}) {
    const query = { ...filter };

    if (mine && requestingUser?.id) {
        // Return only this user's own waiting/ongoing games
        query.players = requestingUser.id;
        if (!query.status) query.status = { $in: ["waiting", "ongoing"] };
    } else if (requestingUser?.id) {
        // Exclude games the user is already in
        query.players = { $ne: requestingUser.id };

        // For regular users, also filter by Elo (+/- 200) if it's a lobby/waiting query
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
        // For anonymous users, only show games that explicitly allow them
        query.allowAnonymous = true;
    }

    return await Game.find(query)
        .skip(skip)
        .limit(limit)
        .populate("players", "username elo elo10s elo30s elo90s profileImage")
        .populate("result.winner", "username");
}

// Fetches the top 5 games based on the highest average Elo rating of participating players
// If there are fewer than 5 ongoing games, it fills the list with the most recent finished games
export async function getTopGames() {
    // fetches all ongoing games and populate player info
    let ongoingGames = await Game.find({ status: "ongoing" })
        .populate("players", "username elo elo10s elo30s elo90s profileImage");

    // Sorts them by average Elo rating (descending order)
    ongoingGames.sort((a, b) => {
        const avgA = a.players.reduce((sum, p) => sum + (p.elo || 1000), 0) / (a.players.length || 1);
        const avgB = b.players.reduce((sum, p) => sum + (p.elo || 1000), 0) / (b.players.length || 1);
        return avgB - avgA;
    });

    // Keep the top 5
    let result = ongoingGames.slice(0, 5);

    // If we need more to reach 5, fetch the latest finished games
    if (result.length < 5) {
        const needed = 5 - result.length;
        const finishedGames = await Game.find({ status: "finished" })
            .sort({ createdAt: -1 }) // newest first
            .limit(needed)
            .populate("players", "username elo elo10s elo30s elo90s profileImage")
            .populate("result.winner", "username");

        result = [...result, ...finishedGames];
    }

    return result;
}

// Gets a single game by the id
export async function getGame(gid) {
    return await Game.findById(gid)
        .populate("players", "username elo elo10s elo30s elo90s profileImage")
        .populate("result.winner", "username");
}

// Adds player to an existing game. Sets status to "ongoing" when 2 players have joined.
export async function joinGame(gid, playerId, requestingUser = null) {
    const game = await Game.findById(gid);
    if (!game) return null;

    // Anonymous users can only join games that explicitly allow them
    if (requestingUser?.type === "anonymous" && !game.allowAnonymous) {
        throw new Error("This game does not allow anonymous players");
    }

    // Prevent joining multiple active games at once
    if (playerId) {
        const activeGame = await Game.findOne({
            players: playerId,
            status: { $in: ["waiting", "ongoing"] },
            _id: { $ne: gid }
        });
        if (activeGame) throw new Error("You are already in an active game");
    }

    // fetching the user to check and deduct points 
    const user = await User.findById(playerId);
    if (!user) throw new Error("User not found");

    // reject if the user doesn't have enough points for the buy-in 
    if (user.points < game.buyIn) {
        throw new Error("You do not have enough points to join this game");
    }

    // deducting the buy-in from the user's points and adding it as their in-game stack
    await User.findByIdAndUpdate(playerId, { $inc: { points: -game.buyIn } });
    await Game.findByIdAndUpdate(gid, {
        $addToSet: { players: playerId },
        $push: { playerStacks: { user: playerId, stack: game.buyIn } }
    });

    const updated = await Game
        .findById(gid)
        .populate("players", "username elo elo10s elo30s elo90s profileImage");

    // auto-start when the required number of players have joined 
    if (updated && updated.players.length >= updated.numPlayers && updated.status === "waiting") {
        updated.status = "ongoing"; // Broad info
        updated.phase = "rolling"; // Detailed info
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

    return updated;
}

// Creates a new game, saves it to the database
export async function createGame(data) {
    return await Game.create(data);
}

// Removes a player from a game.
// - "waiting" game: just remove the player; delete the game if no players left
// - "ongoing" game: forfeit - the other player wins, game becomes "finished"
// - "finished" game: cannot leave (already done)
export async function leaveGame(gid, playerId) {
    const game = await Game.findById(gid);
    if (!game) return null;
    if (game.status === "finished") throw new Error("Cannot leave a finished game");

    const isInGame = game.players.some(p => p.toString() === playerId.toString());
    if (!isInGame) throw new Error("You are not in this game");

    if (game.status === "waiting") {
        await Game.findByIdAndUpdate(gid, { $pull: { players: playerId } });
        const updated = await Game.findById(gid);
        if (updated.players.length === 0) {
            await Game.findByIdAndDelete(gid);
            return { deleted: true };
        }
        return updated;
    }

    // ongoing - forfeit to the other player
    const opponent = game.players.find(p => p.toString() !== playerId.toString());
    return await updateGame(gid, { status: "finished", result: { winner: opponent } });
}

// Updates a game by ID (gid), then returns the updated document
// If the game just became finished and has a winner, updates both players' ELO ratings
export async function updateGame(gid, data) {
    // Fetch the current game first so we can check if it was already finished
    const oldGame = await Game.findById(gid);
    if (!oldGame) return null;

    const updateData = { ...data };
    
    if (updateData.status === "finished"){
        updateData.phase = "finished";

        if (!updateData.result) {
            updateData.result = {};
        }

        const oldGameWithStacks = oldGame;

        updateData.result.scores = oldGameWithStacks.playerStacks.map(entry => ({
            player: entry.user,
            score: entry.stack
        }));
    }

    const game = await Game.findByIdAndUpdate(gid, updateData, { returnDocument: "after" });

    // Only update ELO, wins, and gamesPlayed on the transition to finished (not on repeat calls, not for anonymous games)
    if (!game.isAnonymous && oldGame.status !== "finished" && game.status === "finished" && game.result?.winner) {
        const players = await User.find({ _id: { $in: game.players } });

        // Calculate new Elo for the specific time control variant
        const { newEloA, newEloB, eloField } = calculateElo(players, game.result.winner, game.variant.timeControl);

        // We also update the general Elo for the leaderboard (average change)
        const diffA = newEloA - (players[0][eloField] || 1000);
        const diffB = newEloB - (players[1][eloField] || 1000);
        const generalEloA = players[0].elo + diffA;
        const generalEloB = players[1].elo + diffB;

        const playerAWon = players[0]._id.equals(game.result.winner);

        await User.findByIdAndUpdate(players[0]._id, {
            $set: { [eloField]: newEloA, elo: generalEloA },
            $inc: { gamesPlayed: 1, wins: playerAWon ? 1 : 0 },
            $push: { eloHistory: { elo: generalEloA, date: new Date() } }
        });
        await User.findByIdAndUpdate(players[1]._id, {
            $set: { [eloField]: newEloB, elo: generalEloB },
            $inc: { gamesPlayed: 1, wins: playerAWon ? 0 : 1 },
            $push: { eloHistory: { elo: generalEloB, date: new Date() } }
        });

        // returning each player's remaining stack to their point balance
        for (const entry of game.playerStacks) {
            if (entry.stack > 0) {
                await User.findByIdAndUpdate(entry.user, {
                    $inc: { points: entry.stack }
                });
            }
        }
    }

    // notifying all players in the room that the game has ended
    if (!oldGame.isAnonymous && oldGame.status !== "finished" && game.status === "finished") {
        getIO()?.to(gid.toString()).emit("game-end", { winner: game.result?.winner });
    }

    return game;
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

export async function rollForPlayer(gid, playerId) {
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
    
    // Temp fix for logic duplicate roll prevention
    const round = game.currentRound || 1;

    const alreadyRolledThisRound = game.results.some(result =>
        result.player?.toString() === playerId.toString() &&
        result.round === round
    );

    if (alreadyRolledThisRound) {
        throw new Error("You have already rolled this turn");
    }

    const rolls = rollDice();

    game.results.push({
        player: playerId,
        round,
        hiddenRolls: rolls,
        revealedRolls: [],
        rolls,
        holds: [false, false, false, false, false],
        timestamps: {
            startedAt: new Date()
        }
    });

    const activePlayers = getActivePlayerIds(game);

    const everyoneRolled = activePlayers.every(activePlayerId =>
        game.results.some(result => idsEqual(result.player, activePlayerId) && result.round === round)
    );

    if (everyoneRolled) {
        enterBettingPhase(game, activePlayers);
    } else {
        moveToNextActivePlayer(game);
    }

    await game.save();

    if (everyoneRolled) {
        // notify all players in the room that the betting round has started
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

    const stackEntry = getPlayerStack(game, playerId);
    if (!stackEntry) throw new Error("Player stack not found");

    const contribution = getContribution(game, playerId);
    const currentBet = game.bettingState.currentBet;
    const amountNeededToMatch = currentBet - contribution.amount;

    if (action === "fold") {
        if(!game.foldedUsers.some(id => idsEqual(id, playerId))) {
            game.foldedUsers.push(playerId);
        }
        pushBetLog(game, playerId, "fold", 0);
    } else if (action === "bet") {
        if (currentBet > 0) {
            throw new Error("Cannot bet because a bet already exists; use raise or match");
        }
        if (amount <= 0) {
            throw new Error("Bet amount must be a number greater than 0");
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

    await game.save();

    if (game.phase === "round-ended") {
        // notify all players in the room that the round has ended
        getIO()?.to(gid.toString()).emit("round-end", { round: game.currentRound });
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
        }

        const activePlayers = getActivePlayerIds(game);

        const everyoneRolled = activePlayers.every(activePlayerId =>
            game.results.some(result =>
                idsEqual(result.player, activePlayerId) && result.round === round
            )
        );

        if (everyoneRolled) {
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

    getIO()?.to(gid.toString()).emit("game-state", sanitizeGameForViewer(game, null));
    return game;
}

export function sanitizeGameForViewer(game, viewerId) {
    if (!game) return null;

    const safeGame = typeof game.toObject === "function"
        ? game.toObject()
        : game;

    const publicRolls = rollsArePublic(safeGame);

    safeGame.results = (safeGame.results || []).map((result) => {
        const resultPlayerId = result.player?._id || result.player;
        const isOwner = idsEqual(resultPlayerId, viewerId);

        return {
            ...result,

            // Only the owning player can see their private dice
            hiddenRolls: isOwner ? result.hiddenRolls : [],

            // Everyone can see revealed rolls once reveal/end has happened
            revealedRolls: publicRolls ? result.revealedRolls: [],

            // Keep old `rolls` field safe too, because it currently dupes hiddenRolls
            rolls: isOwner
                ? result.rolls
                : publicRolls
                    ? result.revealedRolls
                    : []
        };
    });

    return safeGame;
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