import { apiFetch } from "@/api";

// get all tournaments, optional filters (e.g. { status: "upcoming" })
export async function getAllTournaments(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return await apiFetch(`/tournaments${params ? `?${params}` : ""}`);
}

// get a single tournament by its id
export async function getTournament(tid) {
    return await apiFetch(`/tournaments/${tid}`);
}

// create a new tournament (admin only)
export async function createTournament(tournamentData) {
    return await apiFetch("/tournaments", {
        method: "POST",
        body: JSON.stringify(tournamentData)
    });
}

// update a tournament (admin only)
export async function updateTournament(tid, data) {
    return await apiFetch(`/tournaments/${tid}`, {
        method: "PUT",
        body: JSON.stringify(data)
    });
}

// join a tournament
export async function joinTournament(tid, playerId) {
    return await apiFetch(`/tournaments/${tid}/join`, {
        method: "PATCH",
        body: JSON.stringify({ player: playerId })
    });
}

// start a tournament and generate first round brackets (admin only)
export async function startTournament(tid) {
    return await apiFetch(`/tournaments/${tid}/start`, { method: "PATCH" });
}

// get upcoming tournaments for the homepage overview
export async function getUpcomingTournaments(limit = 5) {
    return await apiFetch(`/tournaments/upcoming?limit=${limit}`);
}

// get comments for a specific tournament
export async function getTournamentComments(tid) {
    return await apiFetch(`/tournaments/${tid}/comments`);
}
