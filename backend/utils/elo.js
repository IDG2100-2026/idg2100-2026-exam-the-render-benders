const K = 32;

export function calculateElo(ratingA, ratingB, winnerId, playerAId, playerBId) {
    const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    const expectedB = 1 / (1 + Math.pow(10, (ratingA - ratingB) / 400));

    const scoreA = winnerId === playerAId ? 1 : 0;
    const scoreB = winnerId === playerBId ? 1 : 0;

    const newRatingA = Math.round(ratingA + K * (scoreA - expectedA));
    const newRatingB = Math.round(ratingB + K * (scoreB - expectedB));

    return { newRatingA, newRatingB };
}
