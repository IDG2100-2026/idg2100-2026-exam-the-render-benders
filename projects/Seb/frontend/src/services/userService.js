import { apiCall } from './api';

export async function login(username) {
    const response = await apiCall('/users', { userType: 'anonymous' });

    const users = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.users)
                ? response.users
                : [];

    const existingUser = users.find((u) => u.username === username);

    if (existingUser) {
        return { ...existingUser, userType: 'registered' };
    }

    const fallbackAnonymousUser = {
        _id: `temp_${Date.now()}`,
        username,
        userType: 'registered',
        eloRating: 1600,
        eloRatingChange: 0
    };

    return fallbackAnonymousUser;
}

export async function register(userData) {
    return apiCall('/users', { method: 'POST', body: userData, userType: 'anonymous' });
}

export async function getUser(userId) {
    return apiCall(`/users/${userId}`, { userType: 'anonymous' });
}

export async function getUserStats(userId) {
    return apiCall(`/users/${userId}/stats`, { userType: 'anonymous' });
}

export async function getUserMatches(userId) {
    return apiCall(`/users/${userId}/matches`, { userType: 'anonymous' });
}

export async function getUserRecentGames(userId) {
    return apiCall(`/users/${userId}/recent-games`, { userType: 'anonymous' });
}

export async function getAllUsers(filters = {}) {
    const params = new URLSearchParams();
    if (filters.userType) params.append('userType', filters.userType);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall(`/users${query}`, { userType: 'anonymous' });
}

export async function updateUser(userId, userData, userType = 'registered') {
    return apiCall(`/users/${userId}`, {
        method: 'PATCH',
        body: userData,
        userType,
        userId
    });
}

export async function getUserTrophies(userId) {
    return apiCall(`/users/${userId}/trophies`, { userType: 'anonymous' });
}

export async function getPlatformStats() {
    return apiCall('/stats/platform', { userType: 'anonymous' });
}