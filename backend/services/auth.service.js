import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { User } from "../models/user.model.js";
import { hashPwd } from "../utils/hash.js";
import {
    JWT_ACCESS_EXPIRES_IN_SECONDS,
    JWT_REFRESH_EXPIRES_IN_SECONDS,
    JWT_REFRESH_MAX_AGE_MS
} from "../config/constants.js";

const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = process.env;

// Hash refresh tokens before saving to DB
function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

// Used to create a short-lived JWT
function createAccessToken(user, req) {
    return jwt.sign(
        { 
            id: user._id.toString(),
            username: user.username,
            type: user.isAdmin ? "admin" : "user",
            isAdmin: user.isAdmin,
            emailVerified: user.emailVerified,
            ipAddress: req.ip || null
        },
        JWT_ACCESS_SECRET,
        { expiresIn: JWT_ACCESS_EXPIRES_IN_SECONDS }
    );
}

// Used to create a long-lived JWT
function createRefreshToken(user) {
    return jwt.sign(
        { id: user._id.toString() },
        JWT_REFRESH_SECRET,
        { expiresIn: JWT_REFRESH_EXPIRES_IN_SECONDS }
    );
}

function safeUser(user) {
    const { pwd: _pwd, sessions: _sessions, ...safe } = user.toObject();
    return safe;
}

// Creates both tokens, then hashes them before saving them to user.sessions
async function issueSessionForUser(user, req) {
    const accessToken = createAccessToken(user, req);
    const refreshToken = createRefreshToken(user);

    user.sessions.push({
        refreshTokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + JWT_REFRESH_MAX_AGE_MS),
        userAgent: req.headers["user-agent"] || null,
        ipAddress: req.ip || null
    });

    await user.save();

    return {
        user: safeUser(user),
        accessToken,
        refreshToken
    };
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

    return issueSessionForUser(user, req);
}

// Verify token, find matching saved session
// reject expired/missing sessions, update tokens by replacing old session with new
// returns fresh tokens (access and refresh)
async function refresh(refreshToken, req) {
    if (!refreshToken) {
        throw new Error("Missing refresh token");
    }

    let payload;
    try {
        payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch {
        throw new Error("Invalid refresh token");
    }

    const refreshTokenHash = hashToken(refreshToken);
    const user = await User.findOne({
        _id: payload.id,
        "sessions.refreshTokenHash": refreshTokenHash
    });

    if (!user) {
        throw new Error("Refresh session not found");
    }

    const session = user.sessions.find(
        (item) => item.refreshTokenHash === refreshTokenHash
    );

    if (!session || session.expiresAt <= new Date()) {
        user.sessions = user.sessions.filter(
            (item) => item.refreshTokenHash !== refreshTokenHash
        );
        await user.save();
        throw new Error("Refresh session expired");
    }

    // Update refresh token. Remove old session and create a new one
    user.sessions = user.sessions.filter(
        (item) => item.refreshTokenHash !== refreshTokenHash
    );

    const newAccessToken = createAccessToken(user, req);
    const newRefreshToken = createRefreshToken(user);

    user.sessions.push({
        refreshTokenHash: hashToken(newRefreshToken),
        expiresAt: new Date(Date.now() + JWT_REFRESH_MAX_AGE_MS),
        userAgent: req.headers["user-agent"] || null,
        ipAddress: req.ip || null
    });

    await user.save();

    return {
        user: safeUser(user),
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    };
}

// Removes the matching refreshToken from the user document
async function logout(refreshToken) {
    if (!refreshToken) return;

    const refreshTokenHash = hashToken(refreshToken);

    await User.updateOne(
        { "sessions.refreshTokenHash": refreshTokenHash },
        { $pull: { sessions: { refreshTokenHash } } }
    );
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
    issueSessionForUser,
    refresh,
    logout,
    verifyEmail,
    resendVerification
};
