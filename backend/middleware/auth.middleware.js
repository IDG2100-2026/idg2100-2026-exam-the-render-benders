import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendError } from "../utils/controllerHelpers.js";

export function setUserType(req, res, next) {
    const token = req.cookies.accessToken;

    if (!token) {
        req.user = { type: "anonymous", id: null };
        return next();
    }
    
    try {
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
        req.user = {
            type: "anonymous",
            id: null 
        };
    }

    next();
}

export function requireAdmin(req, res, next) {
    if (req.user?.type !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
    }
    next();
}

export async function requireUser(req, res, next) {
    if (req.user?.type === "anonymous") {
        return res.status(401).json({ error: "You must be logged in" });
    }
    next();
}

export async function requireSelfOrAdmin(req, res, next) {
    if (req.user?.type === "admin") return next();
    if (!req.user?.id) return res.status(403).json({ error: "You can only update your own profile" });

    try {
        const target = await User.findOne({ username: req.params.username }).select("_id");
        if (!target) return res.status(404).json({ error: "User not found" });
        if (target._id.toString() === req.user.id) return next();
        return res.status(403).json({ error: "You can only update your own profile" });
    } catch (error) {
        return sendError(res, error);
    }
}

export async function requireNotBanned(req, res, next) {
    if (!req.user?.id) return next();
    try {
        const user = await User.findById(req.user.id).select("isBanned");
        if (!user) return res.status(404).json({ error: "User not found" });
        if (user.isBanned) return res.status(403).json({ error: "You are banned from this platform" });
        next();
    } catch (error) {
        return sendError(res, error);
    }
}

export async function requireEmailVerified(req, res, next) {
    if (req.user?.isGuest) {
        return next();
    }
    
    if (!req.user?.id) {
        return res.status(401).json({ error: "You must be logged in" });
    }

    try {
        const user = await User.findById(req.user.id).select("emailVerified isGuest");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.isGuest || user.emailVerified) {
            return next();
        }

        return res.status(403).json({ error: "You must verify your email before joining games" });
    } catch (err) {
        return sendError(res, err);
    }
}
