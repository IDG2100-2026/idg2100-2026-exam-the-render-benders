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
    MIN_POT_VALUE,
    DEFAULT_TIMEOUT,
    MIN_TIMEOUT,
    BET_ACTIONS,
    DEFAULT_BET,
    MIN_BET
} from "../config/constants.js";

const gameSchema = new mongoose.Schema({
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    numPlayers: {
        type: Number,
        enum: GAME_PLAYER_COUNTS,
        default: DEFAULT_PLAYER_COUNT,
        required: true
    },
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
    buyIn: {
        type: Number,
        enum: GAME_BUY_INS,
        default: DEFAULT_GAME_BUY_INS,
        required: true
    },
    pot: {
        type: Number,
        default: DEFAULT_POT_VALUE,
        min: MIN_POT_VALUE
    },
    variant: {
        rounds: { type: Number, required: true },
        rules: { type: String, enum: ["straights-allowed", "no-straights"], default: "straights-allowed" },
        timeControl: { type: Number, required: true }
    },
    status: {
        type: String,
        enum: GAME_STATUSES,
        default: "waiting"
    },
    phase: {
        type: String,
        enum: GAME_PHASES,
        default: "waiting"
    },
    currentRound: {
        type: Number,
        default: DEFAULT_ROUND,
        min: MIN_ROUND
    },
    currentTurn: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    bettingState: {
        currentBet: {
            type: Number,
            default: DEFAULT_BET,
            min: MIN_BET
        },
        contributions: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            amount:{
                type: Number,
                default: DEFAULT_BET,
                min: MIN_BET
            }
        }],
        actedUsers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        lastAggressor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    foldedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    timeoutState: {
        turnStartedAt: {
            type: Date,
            default: null
        },
        turnExpiresAt: {
            type: Date,
            default: null
        },
        timedOutUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        timeoutCount: {
            type: Number,
            default: DEFAULT_TIMEOUT,
            min: MIN_TIMEOUT
        }
    },
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
        hiddenRolls: [{ type: String, enum: DICE_FACES }],
        revealedRolls: [{ type: String, enum: DICE_FACES }],
        rolls: [{ type: String, enum: DICE_FACES }],
        holds: [{ type: Boolean }],
        rollCount: { type: Number, default: 0 },
        bets: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            action: {
                type: String,
                enum: BET_ACTIONS
            },
            amount: {
                type: Number,
                default: DEFAULT_BET,
                min: MIN_BET
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        outcome: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        timestamps: {
            startedAt: { type: Date, default: Date.now },
            endedAt: { type: Date }
        }
    }],
    result: {
        winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        scores: [{ player: mongoose.Schema.Types.ObjectId, score: Number }]
    },
    isAnonymous: { type: Boolean, default: false },
    allowAnonymous: { type: Boolean, default: false },
    desiredElo: { type: Number, default: DEFAULT_ELO, min: 0 }

}, { timestamps: true });

export const Game = mongoose.model("Game", gameSchema);