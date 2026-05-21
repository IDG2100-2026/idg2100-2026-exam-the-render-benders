import { Game } from "../models/game.model.js";

// Returns platform activity stats: ongoing games count, active users this week, and last 10 games
export async function getActivity() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [ongoingGames, recentGames, activeGames] = await Promise.all([
        // Exclude anonymous games from all activity stats
        Game.countDocuments({ status: "ongoing", isAnonymous: { $ne: true } }),
        Game.find({ isAnonymous: { $ne: true } }).sort({ _id: -1 }).limit(10),
        // Find non-anonymous games created in the last week to count distinct active players
        Game.find({ createdAt: { $gte: oneWeekAgo }, isAnonymous: { $ne: true } }, { players: 1 })
    ]);

    // Count unique players who have played a game this week
    const activePlayerIds = new Set(activeGames.flatMap(g => g.players.map(p => p.toString())));
    const activeUsersThisWeek = activePlayerIds.size;

    return { ongoingGames, activeUsersThisWeek, recentGames };
}

export default { getActivity };
