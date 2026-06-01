import { apiFetch } from "@/api";

// get leaderboard sorted by elo (default)
export async function getLeaderboard() {
    return await apiFetch("/leaderboard");
}

// get leaderboard sorted by wins
export async function getLeaderboardByWins() {
    return await apiFetch("/leaderboard?sortBy=wins");
}

// get leaderboard sorted by games played
export async function getLeaderboardByGamesPlayed() {
    return await apiFetch("/leaderboard?sortBy=gamesPlayed");
}

// get leaderboard sorted by win rate
export async function getLeaderboardByWinRate() {
    return await apiFetch("/leaderboard?sortBy=winRate");
}
