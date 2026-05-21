import mongoose from "mongoose";
import { nanoid } from 'nanoid';

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => `user_${nanoid(10)}`
    },
    // Generic user info
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 3,
        maxLength: 30
    },
    age: {
        type: Number,
        required: true,
        min: 18
    },
    // What type of user ('registered', 'anonymous', 'admin')
    userType: {
        type: String,
        enum: ['registered', 'anonymous', 'admin'],
        default: 'anonymous'
    },
    // ELO
    eloRating: {
        type: Number,
        default: 1600,
        min: 0
    },
    eloRatingChange: {
        type: Number,
        default: 0 // Change in rating in the last week
    },
    // Account status
    isBanned: {
        type: Boolean,
        default: false
    },
    email: String,
    about: String,
    profileImage: String,
    password: String,
    eloRatings: {
      blitz: Number,
      rapid: Number,
      classical: Number
    },
    appearance: {
        theme: {
            type: String,
            enum: ['dark', 'light'],
            default: 'dark'
        },
        boardColor: {
            type: String,
            default: 'default'
        },
        soundEnabled: {
            type: Boolean,
            default: true
        },
        lobbyCount: {
            type: Number,
            default: 5
        }
    }
}, { timestamps: true, _id: false });

export const User = mongoose.model('User', userSchema);