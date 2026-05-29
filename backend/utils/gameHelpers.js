import { DICE_COUNT, DICE_FACES } from "../config/constants.js";

//---- DICE/ROLL HELPERS ----//

// Helper for public roll phases
export function rollsArePublic(game) {
    return ["round-ended", "finished"].includes(game.phase) || game.status === "finished";
}

// Roll 1
export function rollDie() {
    const index = Math.floor(Math.random() * DICE_FACES.length);
    return DICE_FACES[index];
}
// Roll all
export function rollDice( count = DICE_COUNT) {
    return Array.from({ length: count }, () => rollDie());
}

// Evaluation helpers
function getFaceValue(face) {
    return DICE_FACES.indexOf(face);
}

function countFaces(rolls) {
    return rolls.reduce((counts, face) => {
        counts[face] = (counts[face] || 0) + 1;
        return counts;
    }, {});
}

function isStraight(rolls) {
    const values = rolls
        .map(getFaceValue)
        .sort((a, b) => a - b);
    
    const uniqueValues = [...new Set(values)];
    if(uniqueValues.length !== rolls.length) return false;

    return uniqueValues.every((value, index) => index === 0 || value === uniqueValues[index - 1] + 1);
}

function evaluateRolls(rolls, rules = "straights-allowed") {
    const counts = countFaces(rolls);

    const groups = Object.entries(counts)
        .map(([face, count]) => ({
            face,
            count,
            value: getFaceValue(face)
        }))
        .sort((a, b) => {
            if (b.count !== a.count) return b.count - a.count;
            return b.value - a.value;
        });
    
    const countPattern = groups.map(groups => groups.count).sort((a, b) => b - a);
    const straightAllowed = rules === "straights-allowed";
    const hasStraight = straightAllowed && isStraight(rolls);

    if (countPattern[0] === 5) {
        // 8 five of a kind
        return { rank: 8, tiebreakers: groups.map(groups => groups.value) }; 
    }

    if (countPattern[0] === 4) {
        // 7 four of a kind
        return { rank: 7, tiebreakers: groups.map(groups => groups.value) };
    }

    if (countPattern[0] === 3 && countPattern[1] === 2) {
        // 6 full house
        return { rank: 6, tiebreakers: groups.map(groups => groups.value) };
    }
    
    if (hasStraight) {
        // 5 straight
        const highest = Math.max(...rolls.map(getFaceValue));
        return { rank: 5, tiebreakers: [highest] };
    }
    
    if (countPattern[0] === 3) {
        // 4 three of a kind
        return { rank: 4, tiebreakers: groups.map(groups => groups.value) };
    }
    
    if (countPattern[0] === 2 && countPattern[1] == 2) {
        // 3 two pair
        return { rank: 3, tiebreakers: groups.map(groups => groups.value) };
    }
    
    if (countPattern[0] === 2) {
        // 2 pair
        return { rank: 2, tiebreakers: groups.map(groups => groups.value) };
    }
    
    return {
        // 1 high card
        rank: 1,
        tiebreakers: rolls
            .map(getFaceValue)
            .sort((a, b) => b - a)
    };
}

function compareEvaluatedHands(a, b) {
    if (a.rank !== b.rank) return a.rank - b.rank;

    const maxLength = Math.max(a.tiebreakers.length, b.tiebreakers.length);

    for (let i = 0; i < maxLength; i++) {
        const diff = (a.tiebreakers[i] || 0) - (b.tiebreakers[i] || 0);
        if (diff !== 0) return diff;
    }

    return 0;
}


//---- PLAYER HELPERS ----//
// Compare player ids
export function idsEqual(a, b) {
    if (!a || !b) return false;
    return a.toString() === b.toString();
}

export function getActivePlayerIds(game) {
    return game.players.filter(playerId =>
        !game.foldedUsers.some(foldedId => idsEqual(foldedId, playerId))
    );
}

export function getPlayerStack(game, playerId) {
    return game.playerStacks.find(entry => idsEqual(entry.user, playerId));
}


//---- SCORE/BETTING/POT RELATED HELPERS ----//
export function getContribution(game, playerId) {
    let contribution = game.bettingState.contributions.find(entry =>
        idsEqual(entry.user, playerId)
    );

    if (!contribution) {
        contribution = { user: playerId, amount: 0};
        game.bettingState.contributions.push(contribution);
    }

    return contribution;
}

export function getCurrentRoundResult(game, playerId = null) {
    return game.results.find(result =>
        result.round === game.currentRound && (!playerId || idsEqual(result.player, playerId))
    );
}

export function pushBetLog(game, playerId, action, amount) {
    let result = getCurrentRoundResult(game, playerId);

    if (!result) {
        result = {
            player: playerId,
            round: game.currentRound,
            hiddenRolls: [],
            revealedRolls: [],
            rolls: [],
            holds: [false, false, false, false, false],
            bets: [],
            timestamps: { startedAt: new Date()}
        };

        game.results.push(result);
    }

    result.bets.push({
        user: playerId,
        action,
        amount,
        createdAt: new Date()
    });
}

export function splitPot(game, winnerIds) {
    if (!winnerIds.length) return;

    const share = Math.floor(game.pot / winnerIds.length);
    const remainder = game.pot % winnerIds.length;

    for (let i = 0; i < winnerIds.length; i++) {
        const extra = i === 0 ? remainder : 0;

        const stackEntry = getPlayerStack(game, winnerIds[i]);
        if (stackEntry) {
            stackEntry.stack += share + extra;
        }
    }

    game.pot = 0;
}
//---- ROUND RELATED HELPERS ----//

export function turnHasExpired(game){
    return Boolean(
        game.timeoutState?.turnExpiresAt && new Date(game.timeoutState.turnExpiresAt).getTime() <= Date.now()
    );
}

export function startTurnTimer(game, playerId) {
    game.currentTurn = playerId;
    game.timeoutState.turnStartedAt = new Date();
    game.timeoutState.turnExpiresAt = new Date(Date.now() + game.variant.timeControl * 1000);
}

// Turn advancement
export function moveToNextActivePlayer(game) {
    const activePlayers = getActivePlayerIds(game);

    if (activePlayers.length <= 1) {
        game.currentTurn = activePlayers[0] || null;
        return;
    }

    const currentIndex = activePlayers.findIndex(playerId => idsEqual(playerId, game.currentTurn));

    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % activePlayers.length;

    startTurnTimer(game, activePlayers[nextIndex]);
}

// Detect when betting is done
export function bettingRoundIsComplete(game) {
    const activePlayers = getActivePlayerIds(game);
    if (activePlayers.length <= 1) return true;

    return activePlayers.every(playerId => {
        const contribution = getContribution(game, playerId);
        const hasActed = game.bettingState.actedUsers.some(actedId => idsEqual(actedId, playerId));

        return hasActed && contribution.amount === game.bettingState.currentBet;
    });
}

export function resolveRound(game) {
    const activePlayers = getActivePlayerIds(game);

    const roundResults = activePlayers
        .map(playerId => getCurrentRoundResult(game, playerId))
        .filter(Boolean);

    if (roundResults.length === 0) {
        throw new Error("No rolls found for this round");
    }

    for (const result of roundResults) {
        result.revealedRolls = result.hiddenRolls;
        result.rolls = result.hiddenRolls;
        result.timestamps.endedAt = new Date();
    }

    const evaluatedResults = roundResults.map(result => ({
        player: result.player,
        hand: evaluateRolls(result.hiddenRolls, game.variant.rules)
    }));

    let best = evaluatedResults[0];

    for (const evaluated of evaluatedResults.slice(1)) {
        if (compareEvaluatedHands(evaluated.hand, best.hand) > 0) {
            best = evaluated;
        }
    }

    const winners = evaluatedResults
        .filter(evaluated => compareEvaluatedHands(evaluated.hand, best.hand) === 0)
        .map(evaluated => evaluated.player);

    splitPot(game, winners);

    for (const result of roundResults) {
        if (winners.some(winnerId => idsEqual(winnerId, result.player))) {
            result.outcome = result.player;
        }
    }

    game.phase = "round-ended";
    game.currentTurn = null;

    return winners;
}