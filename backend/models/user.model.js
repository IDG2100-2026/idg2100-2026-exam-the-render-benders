import mongoose from "mongoose";

import {
    MAX_USERNAME_LENGTH,
    MIN_USERNAME_LENGTH,
    MIN_PWD_LENGTH,
    MAX_PWD_LENGTH,
    DEFAULT_ELO,
    DEFAULT_THEME,
    DEFAULT_BOARD_COLOR,
    DEFAULT_SOUND,
    DEFAULT_LOBBY_COUNT
} from "../config/constants.js";

// User schema, defines the structure and validation rules for users in the database
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        minLength: [MIN_USERNAME_LENGTH, `Username must be at least ${MIN_USERNAME_LENGTH} characters`],
        maxLength: [MAX_USERNAME_LENGTH, `Username cannot exceed ${MAX_USERNAME_LENGTH} characters`],
        match: [/^[a-zA-Z0-9_À-ɏ]+$/, "Username can only contain letters (including æøå), numbers and underscores"]
    },
    // Guest users have no password, email or date of birth - all three are optional when isGuest is true
    isGuest: {
        type: Boolean,
        default: false
    },
    pwd: {
        type: String,
        required: function () { return !this.isGuest; },
        trim: true,
        minLength: [MIN_PWD_LENGTH, `Passwords must be at least ${MIN_PWD_LENGTH} characters long`],
        maxLength: [MAX_PWD_LENGTH, `Password cannot exceed ${MAX_PWD_LENGTH} characters`]
    },
    email: {
        type: String,
        required: function () { return !this.isGuest; },
        trim: true,
        lowercase: true,
        sparse: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "{VALUE} is not a valid email address"]
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    sessions: [
        {
            refreshTokenHash: {
                type: String,
                required: true
            },
            expiresAt: {
                type: Date,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            userAgent: {
                type: String,
                default: null
            },
            ipAddress: {
                type: String,
                default: null
            }
        }
    ],
    dateOfBirth: {
        type: Date,
        required: function () { return !this.isGuest; }
    },
    aboutMe: {
        type: String,
        default: ""
    },
    profileImage: {
        type: String,
        default: ""
    },

    // ELO rating, automatically updated after each game
    elo: {
        type: Number,
        default: DEFAULT_ELO,
        min: 0
    },

    // Separate ELOs for the three time controls (10s, 30s, 90s)
    elo10s: { type: Number, default: DEFAULT_ELO, min: 0 },
    elo30s: { type: Number, default: DEFAULT_ELO, min: 0 },
    elo90s: { type: Number, default: DEFAULT_ELO, min: 0 },

    // Game stats, updated automatically when a game finishes
    wins: { type: Number, default: 0, min: 0 },
    gamesPlayed: { type: Number, default: 0, min: 0 },

    // Trophies won by winning tournaments, references to Trophy documents
    trophies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trophy"
    }],

    // ELO history - each entry records a rating and when it was set - used to calculate weekly change
    eloHistory: [{
        elo: { type: Number, required: true },
        date: { type: Date, default: Date.now }
    }],

    // Admin and ban status, both default to false for new users
    isAdmin: {
        type: Boolean,
        default: false
    },
    isBanned: {
        type: Boolean,
        default: false
    },

    // Appearance preferences saved per user
    preferences: {
        theme: { type: String, default: DEFAULT_THEME },
        boardColor: { type: String, default: DEFAULT_BOARD_COLOR },
        sound: { type: Boolean, default: DEFAULT_SOUND },
        lobbyCount: { type: Number, default: DEFAULT_LOBBY_COUNT }
    }
}, { timestamps: true });

// Create and export the User model based on the schema
export const User = mongoose.model("User", userSchema);