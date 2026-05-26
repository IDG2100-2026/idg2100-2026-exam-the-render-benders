import mongoose from "mongoose";
import {
    GAME_STATUSES,
    GAME_PHASES,
    DICE_FACES,
    DEFAULT_ROUND,
    MIN_ROUND,
    GAME_PLAYER_COUNTS,
    DEFAULT_PLAYER_COUNT,
    PLAYER_STACK_DEFAULT,
    MIN_PLAYER_STACK_DEFAULT,
    GAME_BUY_INS,
    DEFAULT_GAME_BUY_INS,
    DEFAULT_ELO,
    DEFAULT_POT_VALUE,
    MIN_POT_VALUE
} from "../config/constants.js";

// Game schema defines structure for a poker dice game
const gameSchema = new mongoose.Schema({
    // Players , references to User documents
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    // Number of players allowed
    numPlayers: {
        type: Number,
        enum: GAME_PLAYER_COUNTS,
        default: DEFAULT_PLAYER_COUNT,
        required: true
    },
    // How many points each player still has in the game
    playerStacks: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        stack: {
            type: Number,
            default: PLAYER_STACK_DEFAULT,
            min: MIN_PLAYER_STACK_DEFAULT
        }
    }],
    // How much players have to pay to join a single game
    buyIn: {
        type: Number,
        enum: GAME_BUY_INS,
        default: DEFAULT_GAME_BUY_INS,
        required: true
    },

    // Total points collected from all joined players
    pot: {
        type: Number,
        default: DEFAULT_POT_VALUE,
        min: MIN_POT_VALUE
    },

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
    // Detailed state inside the game flow
    phase: {
        type: String,
        enum: GAME_PHASES,
        default: "waiting"
    },
    // Per-round data: dice rolls, held dice, round winner, and round timing
    results: [{
        player: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        round:{
            type: Number,
            default: DEFAULT_ROUND,
            min: MIN_ROUND
        },
        rolls: [{ type: String, enum: DICE_FACES }],
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