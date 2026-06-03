import mongoose from "mongoose";
import { TOURNAMENT_STATUSES } from "../config/constants.js";

const tournamentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    startDate: {
        type: Date
    },
    tournamentType: {
        type: String,
        enum: ["knockout", "arena"],
        required: true
    },
    gameCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GameCategory"
    },
    format: {
        type: String,
        enum: ["random-pairing"],
        default: "random-pairing",
        required: true
    },
    variant: {
        rounds: { type: Number },
        rules: { type: String, enum: ["straights-allowed", "no-straights"] },
        timeControl: { type: Number }
    },
    status: {
        type: String,
        enum: TOURNAMENT_STATUSES,
        default: "upcoming"
    },
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    minParticipants: { type: Number, default: 2 },
    maxParticipants: { type: Number, default: 8 },
    rounds: [{
        roundNumber: { type: Number },
        matches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Game" }], 
        byePlayer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
    }],
    arenaScores: [{
        participant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        points: { type: Number, default: 0 }
    }],
    durationMinutes: { type: Number, default: 60 },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    trophy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trophy",
        default: null
    }
}, { timestamps: true });

export const Tournament = mongoose.model("Tournament", tournamentSchema);