import mongoose from "mongoose";

// Comment schema, defines the structure for comments on games
const commentSchema = new mongoose.Schema({
    // The comment text
    body: {
        type: String,
        required: true,
        maxLength: 1000
    },
    // The user who wrote the comment, reference to User document
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // The game this comment belongs to, reference to Game document
    game: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Game"
    },
    // The tournament this comment belongs to, reference to Tournament document (optional)
    tournament: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tournament"
    }
}, { timestamps: true });

// Create and export the Comment model
export const Comment = mongoose.model("Comment", commentSchema);