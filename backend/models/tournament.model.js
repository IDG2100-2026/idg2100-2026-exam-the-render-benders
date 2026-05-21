import mongoose from "mongoose";
import { TOURNAMENT_STATUSES } from "../config/constants.js";

// Tournament schema, defines the structure and validation rules for tournaments in the database
const tournamentSchema = new mongoose.Schema({
    // Tournament name
    name: {
        type: String,
        required: true
    },
    // Short description of the tournament
    description: {
        type: String
    },
    // Scheduled start date and time of the tournament
    startDate: {
        type: Date
    },
    // Game format for the brackets
    format: {
        type: String,
        enum: ["single-elimination", "round-robin"],
        required: true
    },
    // Game variant for the tournament matches
    variant: {
        rounds: { type: Number },
        rules: { type: String, enum: ["straights-allowed", "no-straights"] },
        timeControl: { type: Number }
    },
    // Current status of the tournament
    status: {
        type: String,
        enum: TOURNAMENT_STATUSES,
        default: "upcoming"
    },
    // Players in the tournament, references to User documents
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
    ],
    // Winner of the tournament, filled in when finished
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    // Trophy image filename, uploaded via Multer
    trophy: {
        type: String
    },
    // First-round pairings generated when tournament starts (random shuffle)
    bracket: [{
        player1: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        player2: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
    }]
}, { timestamps: true });

// Create and export the Tournament model
export const Tournament = mongoose.model("Tournament", tournamentSchema);