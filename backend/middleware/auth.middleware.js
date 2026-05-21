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