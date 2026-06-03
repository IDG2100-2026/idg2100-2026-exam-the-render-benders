import { apiFetch } from "@/api";

export async function getAllGames(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return await apiFetch(`/games${params ? `?${params}` : ""}`);
}

export async function getTopGames() {
    return await apiFetch("/games/top");
}

export async function getGame(gid) {
    return await apiFetch(`/games/${gid}`);
}

export async function createGame(gameData) {
    return await apiFetch("/games", {
        method: "POST",
        body: JSON.stringify(gameData)
    });
}

export async function joinGame(gid, playerId) {
    return await apiFetch(`/games/${gid}/players`, {
        method: "POST",
        body: JSON.stringify({ player: playerId })
    });
}

export async function leaveGame(gid, userId) {
    return await apiFetch(`/games/${gid}/players/${userId}`, { method: "DELETE" });
}

export async function updateGame(gid, data) {
    return await apiFetch(`/games/${gid}`, {
        method: "PUT",
        body: JSON.stringify(data)
    });
}

export async function getLobbyGames(limit = 5) {
    return await apiFetch(`/games?status=waiting&limit=${limit}`);
}

export async function getFilteredLobbyGames(filters = {}, skip = 0, limit = 20) {
    const params = new URLSearchParams({ status: "waiting", skip, limit, ...filters });
    return await apiFetch(`/games?${params.toString()}`);
}

export async function getGameComments(gid) {
    return await apiFetch(`/games/${gid}/comments`);
}
