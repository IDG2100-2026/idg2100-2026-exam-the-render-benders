// API base URL from .env, fallback to localhost for development
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

// Base URL of the backend (no /api/v1) for assets like uploads
export const BACKEND_URL = API_URL.replace("/api/v1", "");

// Helper to get the correct URL for an asset (profile image, trophy, etc)
export function getAssetUrl(path) {
    // If no path is provided, return the default avatar from the backend
    if (!path) return `${BACKEND_URL}/uploads/default-avatar.svg`;

    // If it's already a full URL, return it as is
    if (path.startsWith("http")) return path;

    // Otherwise, assume it's a filename in the backend's uploads folder
    return `${BACKEND_URL}/uploads/${path}`;
}

// Used for all calls to the backend, sets headers and handles errors
export async function apiFetch(endpoint, options = {}) {
    const headers = { ...options.headers };

    // If we're NOT sending FormData, default to JSON content type
    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    // credentials: "include" sends the httpOnly JWT cookie with every request
    let resp = await fetch(API_URL + endpoint, { ...options, headers, credentials: "include" });

    // if 401, try refreshing the access token once and retry, avoids infinite loop by using raw fetch
    if (resp.status === 401) {
        const refreshResp = await fetch(API_URL + "/auth/refresh", { method: "POST", credentials: "include" });
        if (!refreshResp.ok) throw new Error("Session expired, please log in again");
        resp = await fetch(API_URL + endpoint, { ...options, headers, credentials: "include" });
    }

    if (resp.status === 204) return null;
    const result = await resp.json();
    if (!resp.ok) {
        throw new Error(result?.error || result?.msg || result?.errors?.[0]?.msg || "An error occurred");
    }
    return result;
}
