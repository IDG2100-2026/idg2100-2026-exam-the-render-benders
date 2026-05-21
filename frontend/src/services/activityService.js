import { apiFetch } from "@/api.js";

// get platform activity stats: active players this week, ongoing games, available games
export async function getPlatformActivity() {
    return await apiFetch("/activity");
}
