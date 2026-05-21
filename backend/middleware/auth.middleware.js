// Simple auth middleware - reads headers and sets req.user on every request.
export default function setUserType(req, res, next) {
    const userType = req.headers["x-user-type"];
    const userId = req.headers["x-user-id"];

    req.user = { 
        type: userType || "anonymous",
        id: userId // This can be null for anonymous users
    };
    next();
}