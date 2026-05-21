import { apiFetch } from "@/api.js";

// getting platform activity overview 
export async function getPlatformActivity(){
    const platformActivity = await apiFetch("/activity");
    return platformActivity.activity;
}
