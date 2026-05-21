import { apiFetch } from "@/api.js";

// get all games, optional filters passed as object (e.g. { status: "waiting", limit: 20 })
export async function getAllGames(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return await apiFetch(`/games${params ? `?${params}` : ""}`);
}

// get top 5 games by average Elo (fills with recent finished games if fewer than 5 ongoing)
export async function getTopGames() {
    return await apiFetch("/games/top");
}

// get a single game by its id
export async function getGame(gid) {
    return await apiFetch(`/games/${gid}`);
}

// create a new game
export async function createGame(gameData) {
    return await apiFetch("/games", {
        method: "POST",
        body: JSON.stringify(gameData)
    });
}

// join an existing game from the lobby
export async function joinGame(gid, playerId) {
    return await apiFetch(`/games/${gid}/join`, {
        method: "PATCH",
        body: JSON.stringify({ player: playerId })
    });
}

// update a game (e.g. save result when finished)
export async function updateGame(gid, data) {
    return await apiFetch(`/games/${gid}`, {
        method: "PUT",
        body: JSON.stringify(data)
    });
}

// get waiting games for the lobby preview (with a limit)
export async function getLobbyGames(limit = 5) {
    return await apiFetch(`/games?status=waiting&limit=${limit}`);
}

// get waiting games with filters and pagination for the full lobby page
export async function getFilteredLobbyGames(filters = {}, skip = 0, limit = 20) {
    const params = new URLSearchParams({ status: "waiting", skip, limit, ...filters });
    return await apiFetch(`/games?${params.toString()}`);
}

// get comments for a specific game
export async function getGameComments(gid) {
    return await apiFetch(`/games/${gid}/comments`);
}
