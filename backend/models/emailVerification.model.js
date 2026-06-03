import mongoose from "mongoose";

const emailVerificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true
    },
    codeHash: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const EmailVerification = mongoose.model("EmailVerification", emailVerificationSchema);