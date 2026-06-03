import mongoose from "mongoose";

import {
    DEFAULT_ELO,
    QUEUE_STATUSES
} from "../config/constants.js";

const queueSchema = new mongoose.Schema({
    player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    elo: {
        type: Number,
        default: DEFAULT_ELO,
        min: 0
    },
    status: {
        type: String,
        enum: QUEUE_STATUSES,
        default: "waiting"
    }
}, { timestamps: true });

export const Queue = mongoose.model("Queue", queueSchema);