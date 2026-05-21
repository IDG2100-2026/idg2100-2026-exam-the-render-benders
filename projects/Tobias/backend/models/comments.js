import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    cid: {
        type: Number,
        required: true,
        index: true,
        min: 0,
        max: Number.MAX_SAFE_INTEGER
    },
    uid: {
        type: Number,
        required: true,
        min: 0
    },
    text: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    matchId: {
        type: Number
    },
    tournamentId: {
        type: Number
    }
}, {
    toJSON: {
        transform: (commentDoc, commentObj) => {
            // remove MongoDBs id
            delete commentObj._id;
            // return object without id
            return commentObj;
        }
    },
    versionKey: false
})

commentSchema.pre("validate", function(){
    // if comment id is set or changed
    if (!this.cid){
        // generate random comment id
        this.cid = Math.round( Math.random() * Number.MAX_SAFE_INTEGER);
    }
})

export const Comment = mongoose.model("Comment", commentSchema);
