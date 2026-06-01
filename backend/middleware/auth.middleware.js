import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendError } from "../utils/controllerHelpers.js";

// Reads and verifies the accessToken cookie and sets req.user on every request
export function setUserType(req, res, next) {
    const token = req.cookies.accessToken;

    // no token (anonymous user)
    if (!token) {
        req.user = { type: "anonymous", id: null };
        return next();
    }
    
    try {
        // verifying the token and map the payload to req.user
        const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = {
            id: payload.id,
            username: payload.username,
            type: payload.type,
            isAdmin: payload.isAdmin,
            isGuest: payload.isGuest,
            emailVerified: payload.emailVerified,
            ipAddress: payload.ipAddress
        };
    } catch {
        // invalid or expired token
        req.user = {
            type: "anonymous",
            id: null 
        };
    }

    next();
}

// Blocks non-admin users.
export function requireAdmin(req, res, next) {
    if (req.user?.type !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
    }
    next();
}

// Blocks anonymous users.
export async function requireUser(req, res, next) {
    if (req.user?.type === "anonymous") {
        return res.status(401).json({ error: "You must be logged in" });
    }
    next();
}

// Blocking profile editing for anyone not the profile owner or admin
export async function requireSelfOrAdmin(req, res, next) {
    // admins can always proceed
    if (req.user?.type === "admin") return next();
    // anonymous users are never allowed
    if (!req.user?.id) return res.status(403).json({ error: "You can only update your own profile" });

    try {
        const target = await User.findOne({ username: req.params.username }).select("_id");
        if (!target) return res.status(404).json({ error: "User not found" });
        // comparing the users _id with the logged in user's id
        if (target._id.toString() === req.user.id) return next();
        return res.status(403).json({ error: "You can only update your own profile" });
    } catch (error) {
        return sendError(res, error);
    }
}

// Blocks banned users from joining games and tournaments
export async function requireNotBanned(req, res, next) {
    if (!req.user?.id) return next();
    try {
        // looking up the logged-in user by their id and checking if banned
        const user = await User.findById(req.user.id).select("isBanned");
        if (!user) return res.status(404).json({ error: "User not found" });
        if (user.isBanned) return res.status(403).json({ error: "You are banned from this platform" });
        next();
    } catch (error) {
        return sendError(res, error);
    }
}

// Blocking users who have not verified their email from joining games and tournaments
export function requireEmailVerified(req, res, next) {
    if (req.user?.isGuest) {
        return next();
    }
    if (!req.user.emailVerified) {
        return res.status(403).json({ error: "You must verify your email before joining games" });
    } 
    next();
}
