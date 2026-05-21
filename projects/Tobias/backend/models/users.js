import mongoose from "mongoose";
import { hashPassword } from "../utils/hash.js";
import {
    MIN_USERNAME_LENGTH,
    MAX_USERNAME_LENGTH
} from "../config/constants.js";

const userSchema = new mongoose.Schema({
    // defining the props 
    uid: {
        type: Number,
        required: true,
        index: true,
        min: 0,
        max: Number.MAX_SAFE_INTEGER
    },
    username: {
        type: String,
        trim: true,
        required: true,
        minLength: [MIN_USERNAME_LENGTH, `Minimim username length: ${MIN_USERNAME_LENGTH}`],
        maxLength: [MAX_USERNAME_LENGTH, `Maximum username length: ${MAX_USERNAME_LENGTH}`],
        match: [/^\w+$/, "Username must only be aplha numerical characters"]
    },
    age: {
        type: Number,
        required: true,
        min: [18, "You must be at least 18 years old to register"]
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        // something@something.something format
        match: [/^.+@[a-z]+.[a-z]+$/, "{VALUE} is not a valid email"]
    },
    pwd: {
        type: String,
        required: true,
        trim: true,
    },
    eloRating: {
        type: Number,
        default: 1000,
        min: 0
    },
    eloLastWeek: {
        type: Number,
        default: 1000
    },
    aboutMe: {
        type: String,
        trim: true,
        default: ""
    },
    profilePicture: {
        type: String,
        default: ""
    },
    appearance: {
        darkMode: {
            type: Boolean,
            default: false
        },
        boardColor: {
            type: String,
            default: "darkgreen"
        },
        soundOn: {
            type: Boolean,
            default: false 
        },
        lobbyCount: {
            type: Number,
            default: 5 
        }
    },
    banned: {
        type: Boolean,
        required: true,
        default: false
    },
    trophies: [{
        title: {
            type: String,
            required: true,
            trim: true
        },
        image: {
            type: String,
            trim: true
        }
    }],
    isGuest: {
        type: Boolean,
        default: false
    }
}, {
    toJSON: {
        transform: (userDoc, userObj) => {
            // removing MongoDBs id
            delete userObj._id;
            // removing password before sending to frontend
            delete userObj.pwd;
            // returning the "cleaned" object
            return userObj;
        },
        // removing the __v field mongoose adds
        versionKey: false
    }
});

// running this function before validating a User document
userSchema.pre("validate", function(){
    // checks if uid is changed (also checks if it is set for the first time)
    if (!this.uid){
        // generates a random uid
        this.uid = Math.round( Math.random() * Number.MAX_SAFE_INTEGER);
    }
    // checks if pwd is changed (or set)
    if (this.isModified("pwd")){
        // hashes the password before its being saved
        this.pwd = hashPassword(this.pwd);
    }
});

export const User = mongoose.model("User", userSchema);