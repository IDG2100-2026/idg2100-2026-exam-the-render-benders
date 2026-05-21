import { apiFetch } from "@/api.js";

// leave a comment on a match
export async function leaveMatchComment(mid, commentData){
    const matchComment = await apiFetch(`/matches/${mid}/comments`, {
        method: "POST",
        body: JSON.stringify(commentData),
        // added this because only users should be able to comment
        headers: { "x-user-type": "user"}
    });
    return matchComment.data;
}

// leave a comment on a tournament
export async function leaveTournamentComment(tid, commentData){
    const tournamentComment = await apiFetch(`/tournaments/${tid}/comments`, {
        method: "POST",
        body: JSON.stringify(commentData),
        headers: { "x-user-type": "user" }
    });
    return tournamentComment.data;
}

// get all comments for a match 
export async function getMatchComments(mid) {
    const result = await apiFetch(`/matches/${mid}/comments`);
    return result.comments;
}