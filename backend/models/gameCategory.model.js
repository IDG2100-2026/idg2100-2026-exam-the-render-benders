import mongoose from "mongoose";
import { GAME_TIME_CONTROLS } from "../config/constants.js";

const gameCategorySchema = new mongoose.Schema({
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
        enum: GAME_TIME_CONTROLS,
        required: true
    }
}, { timestamps: true });

export const GameCategory = mongoose.model("GameCategory", gameCategorySchema);
