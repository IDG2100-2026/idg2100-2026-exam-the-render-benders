import { Game } from "../models/game.model.js";

// Returns platform activity stats: ongoing games count, active users this week, and last 10 games
export async function getActivity() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const nonAnonymousGameFilter = { isAnonymous: { $ne: true }};

    const [ongoingGames, waitingGames, availableGamesNow, gamesPlayedLastWeek, activePlayerIds, recentGames] = await Promise.all([
        Game.countDocuments({ ...nonAnonymousGameFilter, status: "ongoing" }),
        Game.countDocuments({ ...nonAnonymousGameFilter, status: "waiting" }),
        Game.countDocuments({ ...nonAnonymousGameFilter, status: "waiting", $expr: { $lt: [{ $size: "$players" }, "$numPlayers"] }}),
        Game.countDocuments({ ...nonAnonymousGameFilter, status: "finished", updatedAt: { $gte: oneWeekAgo }}),
        
        Game.distinct("players", { ...nonAnonymousGameFilter, updatedAt: { $gte: oneWeekAgo }, status: { $in: ["ongoing", "finished"] }}),

        Game.find(nonAnonymousGameFilter).sort({ updatedAt: -1 }).limit(10)
    ]);

    return {
        activePlayers: activePlayerIds.length,
        gamesPlayedLastWeek,
        availableGamesNow,
        // Keeping old field names (So frontend don't break)
        ongoingGames,
        waitingGames,
        activeUsersThisWeek: activePlayerIds.length,
        recentGames
    };
}

export default { getActivity };
