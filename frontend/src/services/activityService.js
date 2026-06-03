import { apiFetch } from "@/api";

export async function getPlatformActivity() {
    return await apiFetch("/activity");
}
