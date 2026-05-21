import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
    mid: {
        type: Number,
        required: true,
        index: true,
        min: 0,
        max: Number.MAX_SAFE_INTEGER
    },
    rounds: {
        type: Number,
        required: true,
        enum: [3, 5, 7],
    },
    includeStraights: {
        type: Boolean,
        default: false
    },
    timeControl: {
        type: Number,
        required: true,
        enum: [3, 10, 30]
    },
    allowAnonymous: {
        type: Boolean,
        default: true
    },
    eloMin: {
        type: Number,
        default: null
    },
    eloMax: {
        type: Number,
        default: null
    },
    players: [{
        type: Number,
        required: true
    }],
    status: {
        // the current state of the match
        type: String,
        enum: ["pending", "ongoing", "finished"],
        default: "pending"
    },
    results: [{
        rolls: [{
            // must have string because of J, Q, K, A
            type: String,
            required: true,
            enum: ["7", "8", "J", "Q", "K", "A"]
        }],
        holds: [{ 
            type: Boolean
        }],
        outcome: {
            // the uid of the winner
            type: Number
        },
        timestamps: {
            startedAt: { 
                type: Date,
                default: Date.now
            },
            endedAt: { 
                type: Date 
            }
        }
    }]
}, {
    toJSON: {
        transform: (userDoc, userObj) => {
            // removing MongoDBs id
            delete userObj._id;
            // returning the object without the id
            return userObj;
        },
        // removing __v field that mongoose adds
        versionKey: false
    }
})

// function to run before validating a Match document 
matchSchema.pre("validate", function(){
    // checks if mid is set or changed
    if (!this.mid){
        // generates random mid
        this.mid = Math.round( Math.random() * Number.MAX_SAFE_INTEGER);
    }
})

export const Match = mongoose.model("Match", matchSchema);