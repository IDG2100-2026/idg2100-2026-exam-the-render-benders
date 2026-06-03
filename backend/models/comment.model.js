import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    body: {
        type: String,
        required: true,
        maxLength: 1000
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },  
    game: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Game"
    }, 
    tournament: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tournament"
    }
}, { timestamps: true });

export const Comment = mongoose.model("Comment", commentSchema);