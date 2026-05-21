
const K = 32; // just to set a value to how much the rating can change per game

export function calculateElo(ratingA, ratingB, winnerId, playerAId, playerBId){
    // 1: calculate expected score for each player
    // the higher the rating compared to the opponent, the closer to 1 the player is 
    // Math.pow(10, x) is 10 to the power of x (a part of the standard ELO formula)
    // if both players have equal ELO, its 0,5 (50/50)
    const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400 ));
    const expectedB = 1 / (1 + Math.pow(10, (ratingA - ratingB) / 400 ));

    // 2: actual score - 1 if the player won, 0 if they lost
    const scoreA = winnerId === playerAId ? 1 : 0;
    const scoreB = winnerId === playerBId ? 1 : 0;

    // 3: calculating the new ratings
    // scoreA - expectedA is the difference between actual and expected result
    // if you win against expectations (upset), then it goes up more
    // if you loose against expectations, then it goes down more
    const newRatingA = Math.round(ratingA + K * (scoreA - expectedA));
    const newRatingB = Math.round(ratingB + K * (scoreB - expectedB));

    // return the new ratings for both players so match.service.js can update the players
    return { newRatingA, newRatingB };
}
