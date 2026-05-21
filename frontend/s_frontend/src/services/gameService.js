import { apiCall } from "./api";

export async function getAllGames(filters = {}, userType = "anonymous", userId = null) {
    const params = new URLSearchParams();

    if (filters.visibility) params.append("visibility", filters.visibility);
    if (filters.gameType) params.append("gameType", filters.gameType);
    if (filters.player) params.append("player", filters.player);
    if (filters.status) params.append("status", filters.status);
    if (filters.limit) params.append("limit", filters.limit);
    if (filters.offset) params.append("offset", filters.offset);

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await apiCall(`/matches${query}`, { userType, userId });

    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.matches)) return response.matches;

    return [];
}

export async function getAllGameCategories() {
    const response = await apiCall('/game-categories', { userType: 'anonymous' });

    if(Array.isArray(response)) return response;
    if(Array.isArray(response?.data)) return response.data;
}

export async function getGameById(gameId, userType = 'anonymous', userId = null) {
    return apiCall(`/matches/${gameId}`, { userType, userId });
}

export async function createGame(gameData, userType = 'registered', userId = null) {
    return apiCall(`/matches`, { method: 'POST', body: gameData, userType, userId });
}

export async function joinGame(gameId, userType = 'registered', userId) {
    return apiCall(`/matches/${gameId}/join`, { method: 'POST', body: { userId }, userType, userId });
}

export async function submitGameResult(gameId, player1Score, player2Score, userType = 'registered', userId) {
    return apiCall(`/matches/${gameId}/result`, { method: 'POST', body: { player1Score, player2Score }, userType, userId });
}

export async function getGameComments(gameId) {
    return apiCall(`/matches/${gameId}/comments`, { userType: 'anonymous' });
}

export async function spectateGame(gameId) {
    return apiCall(`/matches/${gameId}/spectate`, { userType: 'anonymous' });
}