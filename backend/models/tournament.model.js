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
    // Tournament type: knockout (bracket elimination) or arena (score-based)
    tournamentType: {
        type: String,
        enum: ["knockout", "arena"],
        required: true
    },
    // Game category (normalized reference to GameCategory)
    gameCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GameCategory"
    },
    // Tournament format
    format: {
        type: String,
        enum: ["random-pairing"],
        default: "random-pairing",
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
    }],
    // Min / Max players
    minParticipants: { type: Number, default: 2 },
    maxParticipants: { type: Number, default: 8 },
    // Tournament rounds - each round holds match IDs and an optional bye player
    rounds: [{
        roundNumber: { type: Number },
        matches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Game" }],
        // Odd-number rounds: this player advances automatically without playing
        byePlayer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
    }],
    // Arena-only: accumulated scores per participant across all matches
    arenaScores: [{
        participant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        points: { type: Number, default: 0 }
    }],
    // Duration in minutes (arena tournaments only)
    durationMinutes: { type: Number, default: 60 },
    // Winner of the tournament, filled in when finished
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    // Trophy awarded to the winner of this tournament
    trophy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trophy",
        default: null
    }
}, { timestamps: true });

// Create and export the Tournament model
export const Tournament = mongoose.model("Tournament", tournamentSchema);