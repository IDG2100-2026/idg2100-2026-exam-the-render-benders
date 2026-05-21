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

// Used for all calls to the backend - sets headers and handles errors
export async function apiFetch(endpoint, options = {}) {
    const userType = localStorage.getItem("userType") || "anonymous";
    const userId = localStorage.getItem("userId");
    
    // Prepare headers
    const headers = { 
        ...options.headers, 
        "x-user-type": userType,
        ...(userId && { "x-user-id": userId })
    };

    // If we're NOT sending FormData, default to JSON content type
    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const resp = await fetch(API_URL + endpoint, { ...options, headers });
    const result = await resp.json(); // parse JSON response once
    if (!resp.ok) {
        throw new Error(result?.error || result?.msg || result?.errors?.[0]?.msg || "An error occurred"); // throw new error with backend message
    }
    return result;
}
