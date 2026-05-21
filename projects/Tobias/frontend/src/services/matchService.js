import { apiFetch } from "@/api.js";

// getting all matches
export async function getAllMatches(){
    const allMatches = await apiFetch("/matches");
    return allMatches.allMatches;
}

// getting a single match by the mid
export async function getMatch(mid){
    const match = await apiFetch(`/matches/${mid}`);
    return match.matchObj;
}

// creating a new match
export async function createMatch(matchData){
    const createdMatch = await apiFetch("/matches", {
        method: "POST",
        body: JSON.stringify(matchData)
    });
    return createdMatch;
}

// joining an existing match 
export async function joinMatch(mid, userData){
    const joinedMatch = await apiFetch(`/matches/${mid}/join`, {
        method: "PATCH",
        body: JSON.stringify(userData)
    });
    return joinedMatch.matchObj;
}

// getting pending matches for lobby preview (with a limit)
export async function getLobbyMatches(limit = 5){
    const matches = await apiFetch(`/matches?status=pending&limit=${limit}`);
    return matches.allMatches;
}

// getting ongoing matches for top games (with a limit)
export async function getTopMatches(limit = 5){
    const matches = await apiFetch(`/matches?status=ongoing&limit=${limit}`);
    return matches.allMatches;
}

// if there are not 5 games ongoing, I need finished matches
export async function getRecentFinishedMatches(limit = 5){
    const matches = await apiFetch(`/matches?status=finished&limit=${limit}`);
    return matches.allMatches;
}

// getting lobby matches with filters and pagination
export async function getFilteredLobbyMatches(filters = {}, skip = 0, limit = 20, uid = null){
    // URLSearchParams builds the query string (example: ?status=pending&limit=20&skip=0)
    const params = new URLSearchParams({ status: "pending", limit, skip});
    // only add filter params if they are provided
    if (filters.rounds) params.append("rounds", filters.rounds);
    if (filters.timeControl) params.append("timeControl", filters.timeControl);
    if (filters.includeStraights !== undefined) params.append("includeStraights", filters.includeStraights);
    if (uid) params.append("uid", uid);
    const matches = await apiFetch(`/matches?${params.toString()}`);
    return matches.allMatches;
}
