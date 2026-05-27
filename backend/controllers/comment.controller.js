import commentService from "../services/comment.service.js";
import { broadcastToCommentRoom } from "../services/commentSocket.service.js";

// Get all Comments from the database and return them as JSON
export async function getAllComments(req, res) {
    try {
        const skip = parseInt(req.query.skip) || 0;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || undefined;
        const comments = await commentService.getAllComments({ skip, limit, search });
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Get a Comment from the DB and return the Comment as JSON
export async function getComment(req, res) {
    try {
        const comment = await commentService.getComment(req.params.cid);
        if (!comment) return res.status(404).json({ error: "Comment not found" });
        res.status(200).json(comment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Create a new Comment and returns as JSON
export async function createComment(req, res) {
    try {
        const comment = await commentService.createComment(req.body);

        broadcastToCommentRoom(comment, {
            type:"comment:created",
            comment
        });

        res.status(201).json(comment);
    } catch (err) {
        const status = err.message.includes("Banned") ? 403 : err.message.includes("not found") ? 404 : 500;
        res.status(status).json({ error: err.message });
    }
}

// Updates a Comment by ID (cid) and return the updated Comment as JSON
export async function updateComment(req, res) {
    try {
        const comment = await commentService.updateComment(req.params.cid, req.body);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        broadcastToCommentRoom(comment, {
            type: "comment:updated",
            comment
        });

        res.status(200).json(comment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
// Deletes a Comment by ID (cid) - user can delete their own, admin can delete any
export async function deleteComment(req, res) {
    try {
        const comment = await commentService.getComment(req.params.cid);
        if (!comment) return res.status(404).json({ error: "Comment not found" });
        const isOwner = comment.author.toString() === req.user?.id;
        const isAdmin = req.user?.type === "admin";
        if (!isOwner && !isAdmin) return res.status(403).json({ error: "You can only delete your own comments" });
        await commentService.deleteComment(req.params.cid);

        broadcastToCommentRoom(comment, {
            type: "comment:deleted",
            commentId: comment._id,
            game: comment.game,
            tournament: comment.tournament
        });

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Get all Comments for a specific Game and return them as JSON
export async function getCommentsByGame(req, res) {
    try {
        const comments = await commentService.getCommentsByGame(req.params.gid);
        if (!comments) return res.status(404).json({ error: "Game not found" });
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Get all Comments for a specific Tournament and return them as JSON
export async function getCommentsByTournament(req, res) {
    try {
        const comments = await commentService.getCommentsByTournament(req.params.tid);
        if (!comments) return res.status(404).json({ error: "Tournament not found" });
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export default {
    getAllComments,
    getComment,
    createComment,
    updateComment,
    deleteComment,
    getCommentsByGame,
    getCommentsByTournament
};