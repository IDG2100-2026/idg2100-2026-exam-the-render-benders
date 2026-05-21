import { matchedData } from "express-validator";
// imports all user service functions as one object
import userServices from "../services/user.services.js";

// "/users"
export async function getAllUsers(req, res){
    // read limit and skip from the query parameters (and have fallbacks if not provided)
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;
    // building filter object (only adding actually provided fields)
    const filter = {};
    // filter on fields that are provided in the URL query parameter
    if (req.query.banned) filter.banned = req.query.banned === "true";
    if (req.query.search) filter.username = { $regex: req.query.search, $options: "i" };
    // build sort object
    const sort = {};
    // if a sort field is provided, then it should sort ascending (example: a-z or lowest-highest)
    if (req.query.sort) sort[req.query.sort] = 1;
    // gets all users from the database and sends them back
    const allUsersList = await userServices.getAllUsers(limit, skip, filter, sort);
    res.json({ allUsersList });
}

// "/users/:uid" <-- uid in params
export async function getUser(req, res){
    // does not need parseInt, because I have already used toInt() in the validator
    // fetch user from db using the uid
    const userObj = await userServices.getUser(req.params.uid);
    res.json({ userObj });
}

// "/users"
export async function createUser(req, res){
    // matchedData gives only validated fields
    const data = matchedData(req);
    // save new user and get back the auto generated uid
    const newUserId = await userServices.createUser(data);
    if (newUserId){
        // created successfully 
        return res.status(201).json({msg: "User created. ", newUserId});
    } else {
        // ideally the status code would depend on the type of error
        return res.status(400).json({msg: "Failed to create user"});
    }
}

// "/users/:uid" <-- uid in params
export async function updateUser(req, res){
    // does not need parseInt, because I have already used toInt() in the validator
    // only update validated fields
    const updates = matchedData(req);
    const updatedUser = await userServices.updateUser(req.params.uid, updates);
    res.json({ updatedUser });
}

// "/users/:uid" <-- uid in params
export async function banUser(req, res){
    // does not need parseInt, because I have already used toInt() in the validator
    // reuses updateUser in services, but sets banned to true
    const { banned } = req.body;
    const bannedUser = await userServices.updateUser(req.params.uid, { banned });
    res.json({ bannedUser });
}

// "/users/login"
export async function loginUser(req, res){
    const { username, pwd } = req.body;
    const user = await userServices.loginUser(username, pwd);
    if (!user){
        return res.status(401).json({ msg: "Invalid username or password" });
    }
    res.json({ user });
}

// added in oblig 3
export async function updateProfilePicture(req, res) {
    const filename = req.file?.filename;
    if (!filename) return res.status(400).json({ msg: "No image provided" });
    const updatedUser = await userServices.updateUser(req.params.uid, { profilePicture: filename });
    res.json({ updatedUser });
}

export async function createGuestUser(req, res) {
    try {
        const user = await userServices.createGuestUser();
        res.status(201).json({ user });
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
}

export default {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    banUser,
    loginUser,
    updateProfilePicture,
    createGuestUser
}