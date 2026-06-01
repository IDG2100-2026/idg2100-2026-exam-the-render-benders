import { apiFetch } from "@/api";

// get all comments for a specific game
export async function getGameComments(gid) {
    return await apiFetch(`/games/${gid}/comments`);
}

// post a comment on a game
export async function postGameComment(gid, body, authorId) {
    return await apiFetch("/comments", {
        method: "POST",
        body: JSON.stringify({ body, author: authorId, game: gid })
    });
}

// get all comments for a specific tournament
export async function getTournamentComments(tid) {
    return await apiFetch(`/tournaments/${tid}/comments`);
}

// post a comment on a tournament
export async function postTournamentComment(tid, body, authorId) {
    return await apiFetch("/comments", {
        method: "POST",
        body: JSON.stringify({ body, author: authorId, tournament: tid })
    });
}

// delete a comment
export async function deleteComment(cid) {
    return await apiFetch(`/comments/${cid}`, { method: "DELETE" });
}

// update a comment
export async function updateComment(cid, body) {
    return await apiFetch(`/comments/${cid}`, {
        method: "PUT",
        body: JSON.stringify({ body })
    });
}
