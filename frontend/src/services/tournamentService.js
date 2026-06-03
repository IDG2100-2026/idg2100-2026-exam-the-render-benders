import { apiFetch } from "@/api";

export async function getAllTournaments(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return await apiFetch(`/tournaments${params ? `?${params}` : ""}`);
}

export async function getTournament(tid) {
    return await apiFetch(`/tournaments/${tid}`);
}

export async function createTournament(tournamentData) {
    return await apiFetch("/tournaments", {
        method: "POST",
        body: JSON.stringify(tournamentData)
    });
}

export async function updateTournament(tid, data) {
    return await apiFetch(`/tournaments/${tid}`, {
        method: "PUT",
        body: JSON.stringify(data)
    });
}

export async function joinTournament(tid, playerId) {
    return await apiFetch(`/tournaments/${tid}/join`, {
        method: "PATCH",
        body: JSON.stringify({ player: playerId })
    });
}

export async function startTournament(tid) {
    return await apiFetch(`/tournaments/${tid}/start`, { method: "PATCH" });
}

export async function getUpcomingTournaments(limit = 5) {
    return await apiFetch(`/tournaments/upcoming?limit=${limit}`);
}

export async function getTournamentComments(tid) {
    return await apiFetch(`/tournaments/${tid}/comments`);
}
