import { apiCall } from "./api";

export async function postComment(gameId, commentData, userType = "registered", userId) {
    return apiCall(`/matches/${gameId}/comments`, {
        method: "POST",
        body: commentData,
        userType,
        userId
    });
}

export async function deleteComment(commentId, userType = "registered", userId) {
    return apiCall(`/comments/${commentId}`, {
        method: "DELETE",
        body: { userId },
        userType,
        userId
    });
}

export async function getGameComments(gameId) {
    const response = await apiCall(`/matches/${gameId}/comments`, {
        userType: "anonymous"
    });

    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;

    return [];
}