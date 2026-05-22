import express from "express";
import userService from "../services/user.service.js";
import { User } from "../models/user.model.js";

const sessionRouter = express.Router();

// POST /sessions - login, returns user data (will return JWT tokens once auth is upgraded)
sessionRouter.post("/sessions", async (req, res) => {
    try {
        const user = await userService.loginUser(req.body);
        if (!user) return res.status(401).json({ msg: "Invalid username or password" });
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /sessions/guest - create a temporary guest account so anonymous users can join games
// Guest accounts have no password, email or date of birth - they only exist to hold a player slot
sessionRouter.post("/sessions/guest", async (req, res) => {
    try {
        const username = `guest_${Date.now().toString(36)}`;
        const guest = await User.create({ username, isGuest: true });
        const { pwd, ...safeGuest } = guest.toObject();
        res.status(201).json(safeGuest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default sessionRouter;
