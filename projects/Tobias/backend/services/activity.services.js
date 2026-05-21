import { Match } from "../models/matches.js";
import { User } from "../models/users.js";

export async function getPlatformActivity(){
    // counting all ongoing matches
    const ongoingMatches = await Match.countDocuments({ status: "ongoing" });

    // counting the users who have played in the last week
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentMatches = await Match.find({
        "results.timestamps.startedAt": { $gte: lastWeek }
    });
    // getting the unique player from those matches
    const activeUserId = new Set(recentMatches.flatMap(m => m.players));
    const activeUsers = activeUserId.size;

    // getting the last 10 finished matches
    const lastTenMatches = await Match.find({ status: "finished" })
        // sorting them from newest to oldest
        .sort({ _id: -1 })
        .limit(10);
    
    return { ongoingMatches, activeUsers, lastTenMatches };
}

export default { getPlatformActivity };
