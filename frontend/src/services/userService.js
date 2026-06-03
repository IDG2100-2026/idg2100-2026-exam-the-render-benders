import { apiFetch, API_URL } from "@/api";

export async function getUser(username) {
    return await apiFetch(`/users/${username}`);
}

export async function loginUser(username, pwd) {
    return await apiFetch("/sessions", {
        method: "POST",
        body: JSON.stringify({ username, pwd })
    });
}

export async function createUser(userData) {
    return await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify(userData)
    });
}

export async function updateUser(username, userData) {
    return await apiFetch(`/users/${username}`, {
        method: "PATCH",
        body: JSON.stringify(userData)
    });
}

export async function updateProfileImage(username, imageFile) {
    const formData = new FormData();
    formData.append("profileImage", imageFile);
    const resp = await fetch(`${API_URL}/users/${username}`, {
        method: "PATCH",
        body: formData
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data?.error || "Failed to upload image");
    return data;
}

export async function updatePreferences(username, preferences) {
    return await apiFetch(`/users/${username}/preferences`, {
        method: "PATCH",
        body: JSON.stringify(preferences)
    });
}

export async function getAllUsers(skip = 0, limit = 20, search = undefined) {
    const params = new URLSearchParams({ skip, limit });
    if (search) params.append("search", search);
    return await apiFetch(`/users?${params.toString()}`);
}

export async function banUser(username) {
    return await apiFetch(`/users/${username}/ban`, { method: "PATCH" });
}
