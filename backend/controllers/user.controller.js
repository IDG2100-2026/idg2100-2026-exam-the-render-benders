import userService from "../services/user.service.js";
import { sendError } from "../utils/controllerHelpers.js";

export async function getAllUsers(req, res) {
    try {
        const skip = parseInt(req.query.skip) || 0;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || undefined;
        const users = await userService.getAllUsers({ skip, limit, search });
        res.status(200).json(users);
    } catch (err) {
        sendError(res, err);
    }
}

export async function getUser(req, res) {
    try {
        const user = await userService.getUser(req.params.username, req.user);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.status(200).json(user);
    } catch (err) {
        sendError(res, err);
    }
}

export async function getUserGames(req, res) {
    try {
        const skip = parseInt(req.query.skip) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status || undefined;

        const result = await userService.getUserGames(req.params.username, {
            skip,
            limit,
            status
        });

        if (!result) return res.status(404).json({ error: "User not found" });

        res.status(200).json(result);
    } catch (err) {
        sendError(res, err);
    }
}

export async function createUser(req, res) {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json(user);
    } catch (err) {
        sendError(res, err, 400);
    }
}

export async function updateUser(req, res) {
    try {
        if (req.file) {
            req.body.profileImage = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        }
        const user = await userService.updateUser(req.params.username, req.body);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.status(200).json(user);
    } catch (err) {
        sendError(res, err);
    }
}

export async function banUser(req, res) {
    try {
        const user = await userService.banUser(req.params.username);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.status(200).json(user);
    } catch (err) {
        sendError(res, err);
    }
}

export async function getLeaderboard(req, res) {
    try {
        const { sortBy } = req.query;
        const leaderboard = await userService.getLeaderboard(sortBy);
        res.status(200).json(leaderboard);
    } catch (err) {
        sendError(res, err);
    }

}

export async function updatePreferences(req, res) {
    try {
        const user = await userService.updatePreferences(req.params.username, req.body);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.status(200).json(user.preferences);
    } catch (err) {
        sendError(res, err);
    }
}

export async function loginUser(req, res) {
    try {
        const user = await userService.loginUser(req.body);
        if (!user) return res.status(401).json({ msg: "Invalid username or password" });
        res.status(200).json(user);
    } catch (err) {
        sendError(res, err);
    }
}

export async function getUserTrophies(req, res) {
    try {
        const trophies = await userService.getUserTrophies(req.params.username);
        if (trophies === null) return res.status(404).json({ error: "User not found" });
        res.status(200).json(trophies);
    } catch (err) {
        sendError(res, err);
    }
}

export default {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    banUser,
    getLeaderboard,
    loginUser,
    updatePreferences,
    getUserTrophies,
    getUserGames
};
