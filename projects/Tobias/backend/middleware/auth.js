
// check that reads x-user-type header to determine user type
// not full authentication, just sets the user type for the request
export function setUserType(req, res, next){
    const userType = req.headers["x-user-type"];

    // default to anonymous if no header is provided
    if (!userType || !["user", "admin"].includes(userType)){
        req.userType = "anonymous";
    } else {
        req.userType = userType;
    }
    next();
}

// middleware that blocks non-admin users
export function requireAdmin(req, res, next){
    if (req.userType !== "admin"){
        return res.status(403).json({msg: "Admin access required"});
    }
    next();
}

// middleware that blocks anonymous users
export function requireUser(req, res, next){
    if (req.userType === "anonymous"){
        return res.status(401).json({ msg: "You must be logged in"});
    }
    next();
}

