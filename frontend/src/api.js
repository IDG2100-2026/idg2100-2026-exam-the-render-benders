export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export const BACKEND_URL = API_URL.replace("/api/v1", "");

export function getAssetUrl(path) {
    if (!path) return `${BACKEND_URL}/uploads/default-avatar.svg`;

    if (path.startsWith("http")) return path;

    return `${BACKEND_URL}/uploads/${path}`;
}

export async function apiFetch(endpoint, options = {}) {
    const headers = { ...options.headers };

    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    let resp = await fetch(API_URL + endpoint, { ...options, headers, credentials: "include" });

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
