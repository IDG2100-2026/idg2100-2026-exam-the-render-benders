import mongoose from "mongoose";
import { nanoid } from "nanoid";

const gameCatSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => `game_${nanoid(10)}`
    },
    // Category
    name: {
        type: String,
        required: true,
        unique: true
    }, 
    numOfRounds: {
        type: Number,
        enum: [3, 5, 7],
        required: true
    },
    straightsAllowed: {
        type: Boolean,
        required: true
    },
    timePerRound: {
        type: Number,
        enum: [3, 10, 30],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

export const GameCategory = mongoose.model('GameCategory', gameCatSchema);
