import mongoose from "mongoose";

import {
    DEFAULT_ELO,
    QUEUE_STATUSES
} from "../config/constants.js";

const queueSchema = new mongoose.Schema({
    // The player waiting in the queue, reference to User document
    player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // ELO rating at the time of joining the queue
    elo: {
        type: Number,
        default: DEFAULT_ELO,
        min: 0
    },
    // Current status of the queue entry
    status: {
        type: String,
        enum: QUEUE_STATUSES,
        default: "waiting"
    }
}, { timestamps: true });

// Create and export the Queue model based on the schema
export const Queue = mongoose.model("Queue", queueSchema);