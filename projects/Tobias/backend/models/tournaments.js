import mongoose from "mongoose";

const tournamentSchema = new mongoose.Schema({
    tid: {
        type: Number,
        required: true,
        index: true,
        min: 0,
        max: Number.MAX_SAFE_INTEGER 
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    rounds: {
        type: Number,
        enum: [3, 5, 7],
        required: true
    },
    includeStraights: {
        type: Boolean,
        default: false
    },
    timeControl: {
        type: Number,
        enum: [3, 10, 30],
        required: true 
    },
    minPlayers: {
        type: Number,
        required: true
    },
    maxPlayers: {
        type: Number,
        required: true  
    },
    startDateTime: {
        type: Date, 
        required: true 
    },
    trophy: {
        type: String
    },
    players: [{
        type: Number
    }],
    status: {
        type: String,
        enum: ["pending", "ongoing", "finished"],
        default: "pending"
    }

}, {
    toJSON: {
        transform: (tournamentDoc, tournamentObj) => {
            // removing MongoDB's id
            delete tournamentObj._id;
            // return object without id
            return tournamentObj;
        }
    },
    // removing __v field
    versionKey: false
})

tournamentSchema.pre("validate", function(){
    // checks if the tournament id is set or changed
    if (!this.tid){
        // generate random tournament id
        this.tid = Math.round( Math.random() * Number.MAX_SAFE_INTEGER);
    }
})

export const Tournament = mongoose.model("Tournament", tournamentSchema);