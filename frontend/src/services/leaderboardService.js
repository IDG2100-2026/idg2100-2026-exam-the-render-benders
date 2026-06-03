import { apiFetch } from "@/api";

export async function getLeaderboard() {
    return await apiFetch("/leaderboard");
}

export async function getLeaderboardByWins() {
    return await apiFetch("/leaderboard?sortBy=wins");
}

export async function getLeaderboardByGamesPlayed() {
    return await apiFetch("/leaderboard?sortBy=gamesPlayed");
}

export async function getLeaderboardByWinRate() {
    return await apiFetch("/leaderboard?sortBy=winRate");
}
