import mongoose from "mongoose";

const trophySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: null
    },
    tournament: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tournament",
        required: true
    }
}, { timestamps: true });

export const Trophy = mongoose.model("Trophy", trophySchema);
