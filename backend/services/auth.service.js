import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { User } from "../models/user.model.js";
import { hashPwd } from "../utils/hash";

function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

function createAccessToken(user) {
    return jwt.sign(
        { id: user._id, username: user.username, type: user.isAdmin ? "admin" : "user" },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "15m" }
    );
}

function createRefreshToken(user) {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );
}

async function register(data){
    // TODO
    // create user with emailVerified: false
    // generate verification code
    // save codeHash + expireAt in EmailVerification
    // send email, or console.log code for now
    // return safe user withour pwd
}

async function login({ username, pwd }, req) {
    const user = await User.findOne({ username });
    if (!user) return null;
    if (user.pwd !== hashPwd(pwd)) return null;
    
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    user.sessions.push({
        refreshTokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: req.headers["user-agent"] || null,
        ipAddress: req.ip || null
    });

    await user.save();

    const { pwd: _pwd, sessions: _sessions, ...safeUser } = user.toObject();
    return {
        user: safeUser,
        accessToken,
        refreshToken
    };
}

async function refresh(refreshToken) {
    // TODO
    // verify refresh token
    // find user with matching refreshTokenHash in sessions
    // check session expiresAt
    // return new access token, optionally new refresh token too
}

async function logout(refreshToken) {
    // TODO
    // Remove matching refreshTokenHash from user.sessions
}

async function verifyEmail({ userId, code }) {
    // TODO
    // find EmailVerification by userId + codeHash
    // check expiresAt is still in future
    // set user.emailVerified = true
    // delete used verification code
}

async function resendVerification(email) {
    // TODO
    // Find user by email
    // delete old verification codes for that user
    // create new codeHash + expiresAt
    // send email/code
}

export default {
    register,
    login,
    refresh,
    logout,
    verifyEmail,
    resendVerification
};