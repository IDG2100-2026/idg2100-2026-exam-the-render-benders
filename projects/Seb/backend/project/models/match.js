import mongoose from "mongoose";
import { nanoid } from "nanoid";

const matchSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => `match_${nanoid(10)}`
    },
    // Players involved
    player1: {
        type: String,
        ref: 'User',
        required: true
    },
    player2:{ 
        type: String,
        ref:'User',
        required: false
    },
    // Match results
    winner: {
        type: String,
        ref: 'User',
        required: false
    },
    loser: {
        type: String,
        ref: 'User',
        required: false
    },
    // Final scores
    player1Score: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    player2Score: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    // Game type
    gameType: {
        type: String,
        ref: 'GameCategory',
        required: true
    },
    // Visibility
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    // Allow anonymous players
    allowAnonymousPlayers: {
        type: Boolean,
        default: true
    },
    // Elo
    minElo: {
        type: Number,
        default: 0,
        min: 0
    },
    maxElo: {
        type: Number,
        default: 3000,
        min: 0
    },
    // Tournament reference (default null if not apart of a tournament)
    tournament: {
        type: String,
        ref: 'Tournament',
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'ongoing', 'completed'],
        default: 'pending'
    }
}, { timestamps: true, _id: false });

export const Match = mongoose.model('Match', matchSchema);