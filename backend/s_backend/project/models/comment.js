import mongoose from "mongoose";
import { nanoid } from "nanoid";

// Schema for comments on matches and tournaments.
const commentSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => `comment_${nanoid(10)}` // Generates a unique ID for each comment, prefixed with 'comment_' followed by a random string of 10 characters.
    },
    // Who wrote it
    author: {
        type: String,
        ref: 'User',
        required: true
    },
    // Content and type of comment
    content: {
        type: String,
        required: true,
        maxLength: 1000
    },
    commentType: {
        type: String,
        enum: ['match', 'tournament'],
        required: true
    },
    // Reference to match and tournament, based on commentType
    match: {
        type: String,
        ref: 'Match',
        default: null
    },
    tournament: {
        type: String,
        ref: 'Tournament',
        default: null
    }
}, { timestamps: true, _id: false });

// Export the Comment model based on the commentSchema.
export const Comment = mongoose.model('Comment', commentSchema);