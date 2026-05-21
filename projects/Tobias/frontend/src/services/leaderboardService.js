import { apiFetch } from "@/api.js";

// getting all leaderboards 
export async function getAllLeaderboards(){
    const leaderboards = await apiFetch("/leaderboards");
    return leaderboards.leaderboard;
}

// getting leaderboards sorted by wins
export async function getWinsLeaderboards(){
    const winsLeaderboards = await apiFetch("/leaderboards/wins");
    return winsLeaderboards.leaderboard;
}

// getting leaderboards sorted by number of matches
export async function getMatchesLeaderboards(){
    const matchesLeaderboards = await apiFetch("/leaderboards/matches");
    return matchesLeaderboards.leaderboard;
}

// getting leaderboards sorted by win percentage
export async function getWinPercentageLeaderboards(){
    const winPercentageLeaderboards = await apiFetch("/leaderboards/winPercentage");
    return winPercentageLeaderboards.leaderboard;
}
