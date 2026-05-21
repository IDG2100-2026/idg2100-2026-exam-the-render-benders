import mongoose from "mongoose";
import { GAME_STATUSES, DEFAULT_ELO } from "../config/constants.js";

// Game schema defines structure for a poker dice game
const gameSchema = new mongoose.Schema({
    // Players , references to User documents
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
    ],
    // Game variant settings
    variant: {
        rounds: { type: Number, required: true },
        rules: { type: String, enum: ["straights-allowed", "no-straights"], default: "straights-allowed" },
        timeControl: { type: Number, required: true }
    },
    // Current status of the game
    status: {
        type: String,
        enum: GAME_STATUSES,
        default: "waiting"
    },
    // Per-round data: dice rolls, held dice, round winner, and round timing
    results: [{
        rolls: [{ type: String, enum: ["7", "8", "J", "Q", "K", "A"] }],
        holds: [{ type: Boolean }],
        outcome: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamps: {
            startedAt: { type: Date, default: Date.now },
            endedAt: { type: Date }
        }
    }],

    // Game result, filled in when the game is finished
    result: {
        winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        scores: [{ player: mongoose.Schema.Types.ObjectId, score: Number }]
    },
    // True if the game was created by an anonymous user - excluded from platform activity
    isAnonymous: { type: Boolean, default: false },

    // Whether anonymous users are allowed to join this game
    allowAnonymous: { type: Boolean, default: false },

    // The creator's desired opponent Elo rating, used to filter the lobby
    desiredElo: { type: Number, default: DEFAULT_ELO, min: 0 }

}, { timestamps: true });

// Create and export the Game model
export const Game = mongoose.model("Game", gameSchema);