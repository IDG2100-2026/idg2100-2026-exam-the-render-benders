import { Comment } from "../models/comment.model.js";
import { Game } from "../models/game.model.js";
import { Tournament } from "../models/tournament.model.js";
import { User } from "../models/user.model.js";
import { escapeRegex } from "../utils/escapeRegex.js";

export async function getAllComments({ skip = 0, limit = 20, search } = {}) {
    const filter = search ? { body: { $regex: escapeRegex(search), $options: "i" } } : {};

    return await Comment.find(filter)
        .skip(skip)
        .limit(limit)
        .populate("author", "username");
}

export async function getComment(cid) {
    return await Comment.findById(cid).populate("author", "username");
}

export async function createComment(data) {
    const author = await User.findById(data.author);
    if (!author) throw new Error("Author not found");
    if (author.isBanned) throw new Error("Banned users cannot post comments");
    const comment = await Comment.create(data);
    return await comment.populate("author", "username");
}

export async function updateComment(cid, data) {
    return await Comment.findByIdAndUpdate(cid, data, { returnDocument: "after" })
        .populate("author", "username");
}

export async function deleteComment(cid) {
    return await Comment.findByIdAndDelete(cid);
}

export async function getCommentsByGame(gid) {
    const game = await Game.findById(gid);
    if (!game) return null;
    return await Comment.find({ game: gid }).populate("author", "username");
}

export async function getCommentsByTournament(tid) {
    const tournament = await Tournament.findById(tid);
    if (!tournament) return null;
    return await Comment.find({ tournament: tid }).populate("author", "username");
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