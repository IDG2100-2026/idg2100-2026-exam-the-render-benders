import { Comment } from "../models/comment.model.js";
import { Game } from "../models/game.model.js";
import { Tournament } from "../models/tournament.model.js";
import { User } from "../models/user.model.js";

// Returns all the Comments from the DB, supports pagination and search by body text
export async function getAllComments({ skip = 0, limit = 20, search } = {}) {
    const filter = search ? { body: { $regex: search, $options: "i" } } : {};
    return await Comment.find(filter).skip(skip).limit(limit);
}

// Gets a single Comment by the id
export async function getComment(cid) {
    return await Comment.findById(cid);
}

// Creates a new Comment - checks author exists and is not banned
export async function createComment(data) {
    const author = await User.findById(data.author);
    if (!author) throw new Error("Author not found");
    if (author.isBanned) throw new Error("Banned users cannot post comments");
    const comment = await Comment.create(data);
    return await comment.populate("author", "username");
}

// Updates a Comment by ID (cid), then returns the updated document
export async function updateComment(cid, data) {
    return await Comment.findByIdAndUpdate(cid, data, { returnDocument: "after" });
}

// Deletes a Comment by ID (cid)
export async function deleteComment(cid) {
    return await Comment.findByIdAndDelete(cid);
}

// Returns all Comments for a specific Game by game ID (gid), or null if the game doesn't exist
export async function getCommentsByGame(gid) {
    const game = await Game.findById(gid);
    if (!game) return null;
    return await Comment.find({ game: gid }).populate("author", "username");
}

// Returns all Comments for a specific Tournament by tournament ID (tid), or null if the tournament doesn't exist
export async function getCommentsByTournament(tid) {
    const tournament = await Tournament.findById(tid);
    if (!tournament) return null;
    return await Comment.find({ tournament: tid });
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