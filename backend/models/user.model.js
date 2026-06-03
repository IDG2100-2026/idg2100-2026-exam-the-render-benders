import mongoose from "mongoose";

import {
    MAX_USERNAME_LENGTH,
    MIN_USERNAME_LENGTH,
    MIN_PWD_LENGTH,
    MAX_PWD_LENGTH,
    DEFAULT_POINTS,
    MIN_POINTS,
    DEFAULT_ELO,
    DEFAULT_THEME,
    DEFAULT_BOARD_COLOR,
    DEFAULT_SOUND,
    DEFAULT_LOBBY_COUNT
} from "../config/constants.js";

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
            rotatedAt: {
                type: Date,
                default: null
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
    points : {
        type: Number,
        default: DEFAULT_POINTS,
        min: MIN_POINTS
    },
  
    elo: {
        type: Number,
        default: DEFAULT_ELO,
        min: 0
    },

    elo10s: { type: Number, default: DEFAULT_ELO, min: 0 },
    elo30s: { type: Number, default: DEFAULT_ELO, min: 0 },
    elo90s: { type: Number, default: DEFAULT_ELO, min: 0 },

    wins: { type: Number, default: 0, min: 0 },
    gamesPlayed: { type: Number, default: 0, min: 0 },

    trophies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trophy"
    }],

    eloHistory: [{
        elo: { type: Number, required: true },
        date: { type: Date, default: Date.now }
    }],

    isAdmin: {
        type: Boolean,
        default: false
    },
    isBanned: {
        type: Boolean,
        default: false
    },

    lastLogin: {
        type: Date,
        default: null 
    },

    preferences: {
        theme: { type: String, default: DEFAULT_THEME },
        boardColor: { type: String, default: DEFAULT_BOARD_COLOR },
        sound: { type: Boolean, default: DEFAULT_SOUND },
        lobbyCount: { type: Number, default: DEFAULT_LOBBY_COUNT }
    }
}, { timestamps: true });

userSchema.index(
    { email: 1 },
    {
        unique: true,
        partialFilterExpression: {
            email: { $type: "string" }
        }
    }
);


export const User = mongoose.model("User", userSchema);
