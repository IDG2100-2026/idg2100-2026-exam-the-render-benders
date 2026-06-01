import authService from "../services/auth.service.js";

import { ACCESS_COOKIE_OPTIONS, REFRESH_COOKIE_OPTIONS } from "../config/constants.js";
import { sendError } from "../utils/controllerHelpers.js";

async function register(req, res) {
    try {
        const result = await authService.register(req.body, req);
        res.cookie("accessToken", result.accessToken, ACCESS_COOKIE_OPTIONS);
        res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);

        res.status(201).json({
            user: result.user,
            message: result.message
        });
    } catch (err) {
        sendError(res, err, 400);
    }
}

// Set access and refresh token cookies
async function login(req, res) {
    try {
        const result = await authService.login(req.body, req);
        if (!result) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        res.cookie("accessToken", result.accessToken, ACCESS_COOKIE_OPTIONS);
        res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);

        res.status(200).json(result.user);
    } catch (err) {
        sendError(res, err, 400);
    }
}

// Sets new cookies after updaing tokens
async function refresh(req, res) {
    try {
        const result = await authService.refresh(req.cookies.refreshToken, req);

        res.cookie("accessToken", result.accessToken, ACCESS_COOKIE_OPTIONS);
        if (result.refreshToken) {
            res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);
        }

        res.status(200).json(result.user);
    } catch (err) {
        res.clearCookie("accessToken", ACCESS_COOKIE_OPTIONS);
        res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
        sendError(res, err, 401);
    }
}

// Read refreshToken from cookies, removes session, clears both cookies
async function logout(req, res) {
    try {
        await authService.logout(req.cookies.refreshToken);

        res.clearCookie("accessToken", ACCESS_COOKIE_OPTIONS);
        res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);

        res.status(204).send();
    } catch(err) {
        sendError(res, err, 400);
    }
}

async function verifyEmail(req, res) {
    try {
        const result = await authService.verifyEmail(req.body, req);

        res.cookie("accessToken", result.accessToken, ACCESS_COOKIE_OPTIONS);
        res.status(200).json({
            user: result.user,
            message: result.message
        });
    } catch (err) {
        sendError(res, err, 400);
    }
}

async function resendVerification(req, res) {
    try {
        const result = await authService.resendVerification(req.body.email);
        res.status(200).json(result);
    } catch (err) {
        sendError(res, err, 400);
    }
}


export default {
    register,
    login,
    refresh,
    logout,
    verifyEmail,
    resendVerification
};
