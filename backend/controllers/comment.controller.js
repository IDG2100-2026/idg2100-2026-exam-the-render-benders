import commentService from "../services/comment.service.js";
import { broadcastToCommentRoom, broadcastToGameCommentRoom, broadcastToTournamentRoom } from "../socket/comment.socket.js";
import { sendError, statusFromMessage } from "../utils/controllerHelpers.js";
import { isOwnerOrAdmin } from "../utils/authHelpers.js";

export async function getAllComments(req, res) {
    try {
        const skip = parseInt(req.query.skip) || 0;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || undefined;
        const comments = await commentService.getAllComments({ skip, limit, search });
        res.status(200).json(comments);
    } catch (err) {
        sendError(res, err);
    }
}

export async function getComment(req, res) {
    try {
        const comment = await commentService.getComment(req.params.cid);
        if (!comment) return res.status(404).json({ error: "Comment not found" });
        res.status(200).json(comment);
    } catch (err) {
        sendError(res, err);
    }
}

export async function createComment(req, res) {
    try {
        const comment = await commentService.createComment(req.body);

        if (comment.game) {
            broadcastToGameCommentRoom(comment.game, {
                type: "game-comment:created",
                game: comment.game,
                comment
            });
        } else if (comment.tournament) {
            broadcastToTournamentRoom(comment.tournament, {
                type: "tournament-comment:created",
                tournament: comment.tournament,
                comment
            });
        } else {
            broadcastToCommentRoom(comment, {
                type:"comment:created",
                comment
            });
        }


        res.status(201).json(comment);
    } catch (err) {
        const status = statusFromMessage(err.message, [
            { text: "Banned", status: 403 },
            { text: "not found", status: 404 }
        ]);
        sendError(res, err, status);
    }
}

export async function updateComment(req, res) {
    try {
        const existingComment = await commentService.getComment(req.params.cid);
        if (!existingComment) return res.status(404).json({ error: "Comment not found" });
        
        const authorId = existingComment.author._id || existingComment.author;

        if (!isOwnerOrAdmin(authorId, req.user)) return res.status(403).json({ error: "You can only edit your own comments" });

        const comment = await commentService.updateComment(req.params.cid, req.body);

        broadcastToCommentRoom(comment, {
            type: "comment:updated",
            comment
        });

        res.status(200).json(comment);
    } catch (err) {
        sendError(res, err);
    }
}

export async function deleteComment(req, res) {
    try {
        const comment = await commentService.getComment(req.params.cid);
        if (!comment) return res.status(404).json({ error: "Comment not found" });
        const authorId = comment.author._id || comment.author;
        if (!isOwnerOrAdmin(authorId, req.user)) return res.status(403).json({ error: "You can only delete your own comments" });
        await commentService.deleteComment(req.params.cid);

        broadcastToCommentRoom(comment, {
            type: "comment:deleted",
            commentId: comment._id,
            game: comment.game,
            tournament: comment.tournament
        });

        res.status(204).send();
    } catch (err) {
        sendError(res, err);
    }
}

export async function getCommentsByGame(req, res) {
    try {
        const comments = await commentService.getCommentsByGame(req.params.gid);
        if (!comments) return res.status(404).json({ error: "Game not found" });
        res.status(200).json(comments);
    } catch (err) {
        sendError(res, err);
    }
}

export async function getCommentsByTournament(req, res) {
    try {
        const comments = await commentService.getCommentsByTournament(req.params.tid);
        if (!comments) return res.status(404).json({ error: "Tournament not found" });
        res.status(200).json(comments);
    } catch (err) {
        sendError(res, err);
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
