import { User } from "../models/user.model.js";

// Reads headers and sets req.user on every request.
export function setUserType(req, res, next) {
    const userType = req.headers["x-user-type"];
    const userId = req.headers["x-user-id"];

    req.user = {
        type: userType || "anonymous",
        id: userId || null
    };
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
export function requireUser(req, res, next) {
    if (req.user?.type === "anonymous") {
        return res.status(401).json({ error: "You must be logged in" });
    }
    next();
}

// Blocking profile editing for anyone not the profile owner or admin
export async function requireSelfOrAdmin(req, res, next) {
    // TODO: replace DB lookup with JWT payload check once Seb delivers tokens
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
        return res.status(500).json({ error: error.message });
    }
}

// Blocks banned users from joining games and tournaments
export async function requireNotBanned(req, res, next) {
    // TODO: replace DB lookup with JWT payload once Seb delivers tokens
    if (!req.user?.id) return next();
    try {
        // looking up the logged-in user by their id and checking if banned
        const user = await User.findById(req.user.id).select("isBanned");
        if (!user) return res.status(404).json({ error: "User not found" });
        if (user.isBanned) return res.status(403).json({ error: "You are banned from this platform" });
        next();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}