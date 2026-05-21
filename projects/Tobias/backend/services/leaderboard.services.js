import { Match } from "../models/matches.js";

export async function getAllLeaderboards(filter){
    // fetching all 3 leaderboards
    const [byWins, byWinPercentage, byMatches] = await Promise.all([
        getLeaderboardByWins(filter),
        getLeaderboardByWinPercentage(filter),
        getLeaderboardByMatches(filter)
    ]);
    return { byWins, byWinPercentage, byMatches };
}

export async function getLeaderboardByWins(filter){
    return await Match.aggregate([
        // 1: filter matches based on the provided criteria in filter
        { $match: filter },
        // 2: unwind players array for each match, so each player gets their own document
        { $unwind: "$players" },
        // 3: group by player and count wins
        { $group: {
            _id: "$players", // group by user id
            matches: { $sum: 1 }, // count matches per player
            wins: { $sum: { $cond: {
                // checks if the winner (the outcome) is this player
                // $arrayElemAt gets the last element (-1) of the results array because the final round = the winner
                if: { $eq: [{ $arrayElemAt: ["$results.outcome", -1] }, "$players"] },
                // if it is, then count 1 win
                then: 1,
                // else don't give the player a win
                else: 0
            }}}
        }},
        // 4: sort by wins (descending)
        { $sort: { wins: -1 } }
    ])
}

export async function getLeaderboardByWinPercentage(filter){
    return await Match.aggregate([
        // 1: filter matches based on the provided criteria in filter
        { $match: filter },
        // 2: unwind players array so each player gets their own document
        { $unwind: "$players" },
        // 3: group by player and count total matches
        { $group: {
            _id: "$players",
            matches: { $sum: 1 },
            wins: { $sum: { $cond: {
                // checks if the winner (the outcome) is this player
                // $arrayElemAt fetches the last element (with -1) in the results array and the final round = the winner
                if: { $eq: [{ $arrayElemAt: ["$results.outcome", -1] }, "$players"] },
                // if it is, then count 1 win
                then: 1,
                // else don't give the player a win
                else: 0
            }}}
        }},
        // 4: calculate win perccentage
        { $addFields: {
            // $divide divides wins by totalMatches (gets a decimal e.g. 0,6)
            // then multiply by 100 to get percentage
            winPercentage: { $multiply: [ { $divide: ["$wins", "$matches"] }, 100] }
        }},
        // 5: sort by win percentagae
        { $sort: { winPercentage: -1 } }
    ])
}

export async function getLeaderboardByMatches(filter){
    return await Match.aggregate([
        // 1: filter matches based on the provided criteria in filter
        { $match: filter },
        // 2: unwind players array for each match, so each player gets their own document
        { $unwind: "$players" },
        // 3: group by players and count by matches
        { $group: {
            _id: "$players",
            matches: { $sum: 1 }, // count total matches per player
        }},
        // 4: sort by matches
        { $sort: { matches: -1 } }
    ])
}

export default {
    getAllLeaderboards,
    getLeaderboardByWins,
    getLeaderboardByWinPercentage,
    getLeaderboardByMatches
}
