import mongoose from "mongoose";
import { nanoid } from "nanoid";

const tournamentSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => `tournament_${nanoid(10)}`
    },
    // Tournament info
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    tournamentType: {
        type: String,
        enum: ['knockout', 'arena'],
        required: true
    },
    gameCategory: {
        type: String,
        ref: 'GameCategory',
        required: true
    },
    // Tournament Status
    status: {
        type: String,
        enum: ['pending', 'ongoing', 'completed'],
        default: 'pending'
    },
    // Participants
    participants: [{
        type: String,
        ref: 'User'
    }],
    // Min / Max players
    minParticipants: {
        type: Number,
        default: 2
    },
    maxParticipants: {
        type: Number,
        default: 8
    },
    // Schedule
    startDateTime: {
        type: Date,
        required: true
    },
    endDateTime: {
        type: Date,
        default: null // Null until tournament ends
    },
    // Tournament brackets (For knockout and arena rounds). 

    rounds: [{
        roundNumber: Number,
        matches: [String], // References Match documents
        // byePlayer is the participant who automatically advances when there is an
        // odd number of players in a round, they skip the round without playing.
        // Without this field in the schema, Mongoose would silently drop it (strict
        // mode). Making it so bye players would never actually be recorded or carried
        // forward when advancing rounds.
        byePlayer: {
            type: String,
            ref: 'User',
            default: null
        }
    }],
    // Arena Specific
    durationMinutes: {
        type: Number,
        default: 60 // Only for arena tournaments
    },
    // Arena tournament scores (If applicable)
    arenaScores: [{
        participant: String, // User ID
        points: {
            type: Number,
            default: 0
        }
    }],
    // Trophy
    trophy: {
        type: String,
        ref: 'Trophy',
        default: null
    },

    // Tournament creator (admin?)
    createdBy: {
        type: String,
        ref: 'User',
        required: true
    },

    winner: {
        type: String,
        ref: 'User',
        default: null
    }

}, { timestamps: true, _id: false });

export const Tournament = mongoose.model('Tournament', tournamentSchema);