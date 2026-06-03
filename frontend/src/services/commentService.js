import { apiFetch } from "@/api";

export async function getGameComments(gid) {
    return await apiFetch(`/games/${gid}/comments`);
}

export async function postGameComment(gid, body, authorId) {
    return await apiFetch("/comments", {
        method: "POST",
        body: JSON.stringify({ body, author: authorId, game: gid })
    });
}

export async function getTournamentComments(tid) {
    return await apiFetch(`/tournaments/${tid}/comments`);
}

export async function postTournamentComment(tid, body, authorId) {
    return await apiFetch("/comments", {
        method: "POST",
        body: JSON.stringify({ body, author: authorId, tournament: tid })
    });
}

export async function deleteComment(cid) {
    return await apiFetch(`/comments/${cid}`, { method: "DELETE" });
}

export async function updateComment(cid, body) {
    return await apiFetch(`/comments/${cid}`, {
        method: "PUT",
        body: JSON.stringify({ body })
    });
}
