import userService from "../services/user.service.js";

// Get all users from the database and return them as JSON
export async function getAllUsers(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || undefined;
        const users = await userService.getAllUsers({ page, limit, search });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Get a user from DB and return the user as JSON
export async function getUser(req, res) {
    try {
        const user = await userService.getUser(req.params.username);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Create a user and returns as JSON
export async function createUser(req, res) {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Update a user by username and return the updated user as JSON
export async function updateUser(req, res) {
    try {
        if (req.file) {
            req.body.profileImage = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        }
        const user = await userService.updateUser(req.params.username, req.body);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Ban a user by username, sets isBanned to true and returns the updated user
export async function banUser(req, res) {
    try {
        if (req.user?.type !== "admin") return res.status(403).json({ error: "Admin access required" });
        const user = await userService.banUser(req.params.username);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

}

// Returns users sorted by the given field and returns them as JSON
export async function getLeaderboard(req, res) {
    try {
        const { sortBy } = req.query;
        const leaderboard = await userService.getLeaderboard(sortBy);
        res.status(200).json(leaderboard);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

}

// Update appearance preferences for a user by username
export async function updatePreferences(req, res) {
    try {
        const user = await userService.updatePreferences(req.params.username, req.body);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.status(200).json(user.preferences);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Login a user by checking username and password
export async function loginUser(req, res) {
    try {
        const user = await userService.loginUser(req.body);
        if (!user) return res.status(401).json({ msg: "Invalid username or password" });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
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
    updatePreferences
};
