import mongoose from "mongoose";

const emailVerificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // References a User document
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

// expiresAt is set when the code is created; this TTL index removes expired codes automatically
emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Create and export the email verification model based on Schema
export const EmailVerification = mongoose.model("EmailVerification", emailVerificationSchema);