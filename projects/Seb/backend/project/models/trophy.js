import mongoose from "mongoose";
import { nanoid } from "nanoid";

const trophySchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => `trophy_${nanoid(10)}`
    },
    title: {
        type: String,
        required: true
    },

    // Image path / URL
    imageUrl: {
        type: String,
        default: null 
    },

    // Tournament reference (Where the trophy belongs to)
    tournament: {
        type: String,
        ref: 'Tournament',
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

export const Trophy = mongoose.model('Trophy', trophySchema);