import { apiFetch, API_URL } from "@/api.js";

// get a single user by their username, includes recent games and stats
export async function getUser(username) {
    return await apiFetch(`/users/${username}`);
}

// login - returns the user object if credentials are correct
export async function loginUser(username, password) {
    return await apiFetch("/users/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
    });
}

// register a new user
export async function createUser(userData) {
    return await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify(userData)
    });
}

// update a user's profile fields (email, aboutMe, password)
export async function updateUser(username, userData) {
    return await apiFetch(`/users/${username}`, {
        method: "PATCH",
        body: JSON.stringify(userData)
    });
}

// upload a new profile image via FormData
export async function updateProfileImage(username, imageFile) {
    const formData = new FormData();
    formData.append("profileImage", imageFile);
    // use fetch directly so apiFetch doesn't set Content-Type (browser sets multipart boundary)
    const resp = await fetch(`${API_URL}/users/${username}`, {
        method: "PATCH",
        body: formData
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data?.error || "Failed to upload image");
    return data;
}

// update appearance preferences for a user
export async function updatePreferences(username, preferences) {
    return await apiFetch(`/users/${username}/preferences`, {
        method: "PATCH",
        body: JSON.stringify(preferences)
    });
}

// get all users, supports skip-based pagination and search
export async function getAllUsers(skip = 0, limit = 20, search = undefined) {
    const params = new URLSearchParams({ skip, limit });
    if (search) params.append("search", search);
    return await apiFetch(`/users?${params.toString()}`);
}

// ban a user (admin only)
export async function banUser(username) {
    return await apiFetch(`/users/${username}/ban`, { method: "PATCH" });
}
