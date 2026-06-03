import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { sendVerificationEmail } from "./email.service.js";
import { User } from "../models/user.model.js";
import { hashPwd } from "../utils/hash.js";
import {
    JWT_ACCESS_EXPIRES_IN_SECONDS,
    JWT_REFRESH_EXPIRES_IN_SECONDS,
    JWT_REFRESH_MAX_AGE_MS,
    JWT_REFRESH_ROTATION_GRACE_MS,
    EMAIL_VERIFICATION_EXPIRES_MS,
    WEEKLY_POINTS_GAINED,
    WEEKLY_POINT_INTERVAL
} from "../config/constants.js";

import { EmailVerification } from "../models/emailVerification.model.js";

const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = process.env;

function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

function createAccessToken(user, req) {
    return jwt.sign(
        { 
            id: user._id.toString(),
            username: user.username,
            type: user.isAdmin ? "admin" : "user",
            isAdmin: user.isAdmin,
            isGuest: user.isGuest,
            emailVerified: user.emailVerified,
            ipAddress: req.ip || null
        },
        JWT_ACCESS_SECRET,
        { expiresIn: JWT_ACCESS_EXPIRES_IN_SECONDS }
    );
}


function createRefreshToken(user) {
    return jwt.sign(
        {
            id: user._id.toString(),
            jti: crypto.randomUUID()
        },
        JWT_REFRESH_SECRET,
        { expiresIn: JWT_REFRESH_EXPIRES_IN_SECONDS }
    );
}

function safeUser(user) {
    const { pwd: _pwd, sessions: _sessions, ...safe } = user.toObject();
    return safe;
}

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

function createVerificationCode() {
    return crypto.randomInt(100000, 999999).toString();
}

function hashVerificationCode(code) {
    return crypto.createHash("sha256").update(code).digest("hex");
}

async function createEmailVerification(user) {
    const code = createVerificationCode();

    await EmailVerification.create({
        userId: user._id,
        codeHash: hashVerificationCode(code),
        expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_EXPIRES_MS)
    });

    await sendVerificationEmail(user, code);

    return code;
}

async function register(data, req){
    const existingUser = await User.findOne({
        $or: [
            { username: data.username },
            { email: data.email?.toLowerCase() }
        ]
    });

    if (existingUser) {
        throw new Error("Username or email is already in use");
    }

    const user = await User.create({
        ...data,
        email: data.email?.toLowerCase(),
        pwd: hashPwd(data.pwd),
        emailVerified: false
    });

    const session = await issueSessionForUser(user, req);

    return {
        ...session,
        message: "User registered. Please verify your email before playing."
    };
}

async function verifyEmail({ userId, code }, req) {
    if(!userId || !code) {
        throw new Error("Missing userId or verification code");
    }

    const codeHash = hashVerificationCode(code);

    const verification = await EmailVerification.findOne({ userId, codeHash });
    if (!verification) {
        throw new Error("Invalid verification code");
    }

    if (verification.expiresAt <= new Date()) {
        await EmailVerification.deleteOne({ _id: verification._id });
        throw new Error("Verification code has expired");
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { emailVerified: true },
        { new: true }
    );

    if (!user) {
        throw new Error("User not found");
    }

    await EmailVerification.deleteMany({ userId });

    return {
        user: safeUser(user),
        accessToken: createAccessToken(user, req),
        message: "Email verified successfully"
    };
}

async function login({ username, pwd }, req) {
    const user = await User.findOne({ username });
    if (!user) return null;
    if (user.pwd !== hashPwd(pwd)) return null;

    const now = new Date();
    if (!user.lastLogin || now - user.lastLogin >= WEEKLY_POINT_INTERVAL) {
        user.points += WEEKLY_POINTS_GAINED;
    }
    user.lastLogin = now;

    return issueSessionForUser(user, req);
}

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

    const now = new Date();
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
    const rotationGraceExpired = session?.rotatedAt &&
        session.rotatedAt.getTime() + JWT_REFRESH_ROTATION_GRACE_MS <= now.getTime();

    if (!session || session.expiresAt <= now || rotationGraceExpired) {
        user.sessions = user.sessions.filter(
            (item) => item.refreshTokenHash !== refreshTokenHash
        );
        await user.save();
        throw new Error("Refresh session expired");
    }

    const newAccessToken = createAccessToken(user, req);
    const newRefreshToken = createRefreshToken(user);
    const newSession = {
        refreshTokenHash: hashToken(newRefreshToken),
        expiresAt: new Date(now.getTime() + JWT_REFRESH_MAX_AGE_MS),
        userAgent: req.headers["user-agent"] || null,
        ipAddress: req.ip || null
    };

    await User.updateOne(
        {
            _id: user._id,
            sessions: {
                $elemMatch: {
                    refreshTokenHash,
                    expiresAt: { $gt: now }
                }
            }
        },
        { $push: { sessions: newSession } }
    );

    await User.updateOne(
        {
            _id: user._id,
            "sessions.refreshTokenHash": refreshTokenHash,
            "sessions.rotatedAt": null
        },
        {
            $set: { "sessions.$.rotatedAt": now }
        }
    );

    const graceCutoff = new Date(now.getTime() - JWT_REFRESH_ROTATION_GRACE_MS);
    await User.updateOne(
        { _id: user._id },
        {
            $pull: {
                sessions: {
                    $or: [
                        { expiresAt: { $lte: now } },
                        { rotatedAt: { $lte: graceCutoff } }
                    ]
                }
            }
        }
    );

    return {
        user: safeUser(user),
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    };
}

async function logout(refreshToken) {
    if (!refreshToken) return;

    const refreshTokenHash = hashToken(refreshToken);

    await User.updateOne(
        { "sessions.refreshTokenHash": refreshTokenHash },
        { $pull: { sessions: { refreshTokenHash } } }
    );
}

async function resendVerification(email) {
    if (!email) {
        throw new Error("Missing email");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new Error("User not found");
    }

    if (user.emailVerified) {
        return {
            message: "Email is already verified"
        };
    }

    await EmailVerification.deleteMany({ userId: user._id });
    await createEmailVerification(user);

    return {
        message: "A new verification code has been sent"
    };
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
