import { Match } from "../models/matches.js";
import { User } from "../models/users.js";
import { calculateElo } from "../utils/elo.js";

export async function getAllMatches(limit, skip, filter, sort, uid = null){
    if (uid) {
        // registered user: filter by ELO range
        const user = await User.findOne({ uid });
        if (user) {
            filter.$and = [
                { $or: [{ eloMin: null }, { eloMin: { $lte: user.eloRating } }] },
                { $or: [{ eloMax: null }, { eloMax: { $gte: user.eloRating } }] }
            ];
        }
    } else {
        // anonymous: only show games that allow anonymous players
        filter.allowAnonymous = { $ne: false };
    }
    return await Match.find(filter).sort(sort).limit(limit).skip(skip);
}

export async function getMatch(mid){
    return await Match.findOne({ mid });
}

export async function createMatch(matchObj){
    // getting the requesting users ELO
    const user = await User.findOne({ uid: matchObj.players[0] });
    
    let alreadyActive = null;
    if (matchObj.players[0]) {
        // checking if the user already has a pending or ongoing match
        alreadyActive = await Match.findOne({
            players: { $in: [matchObj.players[0]] },
            status: { $in: ["pending", "ongoing"] } 
        });
    }
    if (alreadyActive) {
        throw new Error("You already have an active game");
    }

    // finding a pending match with the same game settings where one player is waiting
    const pendingMatch = await Match.findOne({
        status: "pending",
        rounds: matchObj.rounds,
        includeStraights: matchObj.includeStraights,
        timeControl: matchObj.timeControl,
        players: { $size: 1 }
    });

    if (pendingMatch && pendingMatch.players[0] !== matchObj.players[0]){
        // getting the existing players ELO
        const existingPlayer = await User.findOne({ uid: pendingMatch.players[0] });
        // calculating ELO difference between the two players
        const eloDiff = Math.abs(user.eloRating - existingPlayer.eloRating);

        // if within the tolerance (difference in ELO), join the existing match instead of creating a new one
        if (eloDiff <= 200){
            return await joinMatch(pendingMatch.mid, matchObj.players[0]);
        } 
    }
    // if there is no suitable match found, then I create a new pending match
    // creating the match
    const match = new Match(matchObj);
    // saving it to the db
    const savedMatch = await match.save();
    // returning auto generated uid of the match
    return savedMatch.mid;
}

export async function checkMatchExistence(mid){
    // checks if match with the mid already exists
    const matchExists = await Match.exists({ mid });
    if (matchExists){
        // match found, validation passes
        return true;
    } else {
        // if match does not exist
        throw new Error(`A match with id ${mid} does not exist`);
    }
}

export async function joinMatch(mid, uid){
    return await Match.findOneAndUpdate(
        { mid }, // finds match with specific mid
        { $push: { players: uid }, status: "ongoing" }, // adds player with specific uid and changes status to "ongoing"
        { new: true } // returning updated version
    )
}

export async function saveMatchResult(mid, results){
    const match = await Match.findOneAndUpdate(
        { mid }, // finds match with specific mid
        { results, status: "finished" }, // sets the match status to "finished"
        { new: true } // returning the new version
    );

    // get the winner uid from the last round in results
    const winnerId = results[results.length - 1].outcome;

    // fetching both the players from the db
    const [playerA, playerB] = await Promise.all([
        User.findOne({ uid: match.players[0] }),
        User.findOne({ uid: match.players[1] })
    ]);

    // calculating the new ELO using the algorithm 
    const { newRatingA, newRatingB } = calculateElo(
        playerA.eloRating, playerB.eloRating,
        winnerId, playerA.uid, playerB.uid
    );

    // updating both players ELO in the db 
    await Promise.all([
        User.updateOne({ uid: playerA.uid }, { eloLastWeek: playerA.eloRating, eloRating: newRatingA }),
        User.updateOne({ uid: playerB.uid }, { eloLastWeek: playerB.eloRating, eloRating: newRatingB })
    ]);

    return match;
}

export async function getUsersRecentMatches(uid){
    // fetch the 10 most recent matches for a specific user
    // $in checks if the uid exists in the player array for the game
    return await Match.find({ players: { $in: [uid] } })
        .sort({ _id: -1 }) // the newest first
        .limit(10);
}

// added in oblig 3
export async function getUserMatchStats(uid) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentMatches = await Match.find({
        players: { $in: [uid] },
        status: "finished",
        "results.timestamps.endedAt": { $gte: thirtyDaysAgo }
    });

    let wins = 0;
    let losses = 0;
    for (const match of recentMatches) {
        const lastResult = match.results[match.results.length - 1];
        if (lastResult?.outcome === uid) {
            wins++;
        } else {
            losses++;
        }
    }
    return { wins, losses };
}

export default {
    getAllMatches,
    getMatch,
    createMatch,
    checkMatchExistence,
    joinMatch,
    saveMatchResult,
    getUsersRecentMatches,
    getUserMatchStats
}