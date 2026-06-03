const K = 32;

function  getExpectedScore(ratingA, ratingB) {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export function calculateElo(ratingA, ratingB, winnerId, playerAId, playerBId) {
    const expectedA = getExpectedScore(ratingA, ratingB);
    const expectedB = getExpectedScore(ratingB, ratingA);

    const scoreA = winnerId === playerAId ? 1 : 0;
    const scoreB = winnerId === playerBId ? 1 : 0;

    const newRatingA = Math.round(ratingA + K * (scoreA - expectedA));
    const newRatingB = Math.round(ratingB + K * (scoreB - expectedB));

    return { newRatingA, newRatingB };
}

export function getEloField(timeControl = 10) {
    if (timeControl === 10) return "elo10s";
    if (timeControl === 30) return "elo30s";
    if (timeControl === 90) return "elo90s";
    return "elo"; 
}

export function calculatePairwiseEloUpdates(players, scoreByPlayerId, eloField) {
    const deltas = new Map();

    for (const player of players) {
        deltas.set(player._id.toString(), 0);
    }

    for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++){
            const playerA = players[i];
            const playerB = players[j];

            const playerAId = playerA._id.toString();
            const playerBId = playerB._id.toString();

            const ratingA = playerA[eloField] || 1000;
            const ratingB = playerB[eloField] || 1000;

            const scoreA = scoreByPlayerId.get(playerAId) ?? 0;
            const scoreB = scoreByPlayerId.get(playerBId) ?? 0;

            let actualA = 0.5;
            let actualB = 0.5;

            if (scoreA > scoreB) {
                actualA = 1;
                actualB = 0;
            } else if (scoreA < scoreB) {
                actualA = 0;
                actualB = 1;
            }

            const expectedA = getExpectedScore(ratingA, ratingB);
            const expectedB = getExpectedScore(ratingB, ratingA);

            deltas.set(playerAId, deltas.get(playerAId) + K * (actualA - expectedA));
            deltas.set(playerBId, deltas.get(playerBId) + K * (actualB - expectedB));
        }
    }

    return players.map(player => {
        const playerId = player._id.toString();
        const oldRating = player[eloField] || 1000;
        const roundedDelta = Math.round(deltas.get(playerId));

        return {
            player,
            playerId,
            oldRating,
            newRating: Math.max(0, oldRating + roundedDelta),
            delta: roundedDelta
        };
    });
}