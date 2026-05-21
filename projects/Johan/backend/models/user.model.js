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
        match: [/^\w+$/, "Username can only contain letters and numbers"]
    },
    pwd: {
        type: String,
        required: true,
        trim: true,
        minLength: [MIN_PWD_LENGTH, `Passwords must be at least ${MIN_PWD_LENGTH} characters long`],
        maxLength: [MAX_PWD_LENGTH, `Password cannot exceed ${MAX_PWD_LENGTH} characters`]
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        match: [/^.+@[a-z]+\.[a-z]+$/, "{VALUE} is not a valid email address"]
    },
    dateOfBirth: {
        type: Date,
        required: true
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

    // Separate ELOs for the three time controls
    elo3s: { type: Number, default: DEFAULT_ELO, min: 0 },
    elo10s: { type: Number, default: DEFAULT_ELO, min: 0 },
    elo30s: { type: Number, default: DEFAULT_ELO, min: 0 },

    // Game stats, updated automatically when a game finishes
    wins: { type: Number, default: 0, min: 0 },
    gamesPlayed: { type: Number, default: 0, min: 0 },

    // Trophies won by winning tournaments, each has a title and image
    trophies: [{
        title: { type: String, required: true },
        image: { type: String, required: true }
    }
    ],

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