import gameService from "../services/game.service.js";

// Get all games from the database and return them as JSON
export async function getAllGames(req, res) {
    try {
        const skip = parseInt(req.query.skip) || 0;
        const limit = parseInt(req.query.limit) || 20;
        const filter = {};
        if (req.query.status) filter.status = req.query.status;

        // Pass the user info from req.user (set by auth middleware) to the service
        const games = await gameService.getAllGames({
            skip,
            limit,
            filter,
            requestingUser: req.user,
            mine: req.query.mine === "true"
        });
        res.status(200).json(games);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Get the top 5 games with highest average Elo
export async function getTopGames(req, res) {
    try {
        const games = await gameService.getTopGames();
        res.status(200).json(games);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Get a game from the DB and return the game as JSON
export async function getGame(req, res) {
    try {
        const game = await gameService.getGame(req.params.gid);
        if (!game) return res.status(404).json({ error: "Game not found" });
        res.status(200).json(game);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Returns the state of a game (used to restore state after reload)
export async function getGameState(req, res) {
    try {
        const game = await gameService.getGame(req.params.gid);
        if (!game) return res.status(404).json({ error: "Game not found" });
        res.status(200).json(game);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
} 

// Create a new game and returns as JSON
// Anonymous games are flagged so they are excluded from platform activity
export async function createGame(req, res) {
    try {
        const isAnonymous = req.user?.type === "anonymous";
        const game = await gameService.createGame({ ...req.body, isAnonymous });
        res.status(201).json(game);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Adds a player to a game and returns the updated game as JSON
export async function joinGame(req, res) {
    try {
        const game = await gameService.joinGame(req.params.gid, req.body.player, req.user);
        if (!game) return res.status(404).json({ error: "Game not found" });
        res.status(201).json(game);
    } catch (err) {
        const status = err.message.includes("does not allow anonymous") ? 403
            : err.message.includes("already in an active game") ? 400 : 500;
        res.status(status).json({ error: err.message });
    }
}

// Removes a player from a game - DELETE /games/:gid/players/:uid
// Only the player themselves (or an admin) can remove a player
export async function leaveGame(req, res) {
    try {
        const { uid } = req.params;
        const isAdmin = req.user?.type === "admin";
        if (!isAdmin && req.user?.id !== uid) {
            return res.status(403).json({ error: "You can only remove yourself from a game" });
        }
        const result = await gameService.leaveGame(req.params.gid, uid);
        if (!result) return res.status(404).json({ error: "Game not found" });
        res.status(200).json(result);
    } catch (err) {
        const status = err.message.includes("not in this game") ? 403
            : err.message.includes("finished") ? 400 : 500;
        res.status(status).json({ error: err.message });
    }
}

// Updates a game by ID (gid) and return the updated game as JSON
export async function updateGame(req, res) {
    try {
        const game = await gameService.updateGame(req.params.gid, req.body);
        if (!game) return res.status(404).json({ error: "Game not found" });
        res.status(200).json(game);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export default {
    getAllGames,
    getTopGames,
    getGame,
    getGameState,
    createGame,
    joinGame,
    leaveGame,
    updateGame
};