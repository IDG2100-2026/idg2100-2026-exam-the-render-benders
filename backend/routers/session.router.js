import express from "express";
import { User } from "../models/user.model.js";
import authService from "../services/auth.service.js";
import { ACCESS_COOKIE_OPTIONS, REFRESH_COOKIE_OPTIONS } from "../config/constants.js";
import { sendError } from "../utils/controllerHelpers.js";

const sessionRouter = express.Router();

function setAuthCookies(res, result) {
    res.cookie("accessToken", result.accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);
}

// POST /sessions/guest - create a temporary guest account so anonymous users can join games
// Guest accounts have no password, email or date of birth - they only exist to hold a player slot
sessionRouter.post("/sessions/guest", async (req, res) => {
    try {
        const username = `guest_${Date.now().toString(36)}`;
        const guest = await User.create({ username, isGuest: true });
        const result = await authService.issueSessionForUser(guest, req);

        setAuthCookies(res, result);
        res.status(201).json(result.user);
    } catch (err) {
        sendError(res, err);
    }
});

export default sessionRouter;
