import gameService from "../services/game.service.js";
import { sendError, statusFromMessage } from "../utils/controllerHelpers.js";

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
        res.status(200).json(
            games.map(game => gameService.sanitizeGameForViewer(game, req.user?.id))
        );
    } catch (err) {
        sendError(res, err);
    }
}

// Get the top 5 games with highest average Elo
export async function getTopGames(req, res) {
    try {
        const games = await gameService.getTopGames();
        res.status(200).json(
            games.map(game => gameService.sanitizeGameForViewer(game, req.user?.id))
        );
    } catch (err) {
        sendError(res, err);
    }
}

// Get a game from the DB and return the game as JSON
export async function getGame(req, res) {
    try {
        const game = await gameService.getGame(req.params.gid);
        if (!game) return res.status(404).json({ error: "Game not found" });
        res.status(200).json(gameService.sanitizeGameForViewer(game, req.user?.id));
    } catch (err) {
        sendError(res, err);
    }
}

// Returns the state of a game (used to restore state after reload)
export async function getGameState(req, res) {
    try {
        const game = await gameService.getGame(req.params.gid);
        if (!game) return res.status(404).json({ error: "Game not found" });
        res.status(200).json(gameService.sanitizeGameForViewer(game, req.user?.id));
    } catch (err) {
        sendError(res, err);
    }
} 

// Create a new game and returns as JSON
// Anonymous games are flagged so they are excluded from platform activity
export async function createGame(req, res) {
    try {
        const isAnonymous = req.user?.type === "anonymous";
        const game = await gameService.createGame({ ...req.body, isAnonymous });
        res.status(201).json(gameService.sanitizeGameForViewer(game, req.user?.id));
    } catch (err) {
        sendError(res, err);
    }
}

// Adds a player to a game and returns the updated game as JSON
export async function joinGame(req, res) {
    try {
        const game = await gameService.joinGame(req.params.gid, req.user.id, req.user);
        if (!game) return res.status(404).json({ error: "Game not found" });
        res.status(201).json(gameService.sanitizeGameForViewer(game, req.user?.id));
    } catch (err) {
        const status = statusFromMessage(err.message, [
            { text: "does not allow anonymous", status: 403 },
            { text: "already in an active game", status: 400 }
        ]);
        sendError(res, err, status);
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

        if (result.deleted) return res.status(200).json(result);
        res.status(200).json(gameService.sanitizeGameForViewer(result, req.user?.id));
    } catch (err) {
        const status = statusFromMessage(err.message, [
            { text: "not in this game", status: 403 },
            { text: "finished", status: 400 }
        ]);
        sendError(res, err, status);
    }
}

// Updates a game by ID (gid) and return the updated game as JSON
// Only a player in the game or an admin is allowed to update it -
// without this check any logged-in user could force the game to "finished"
// and trigger ELO recalculation and stack distribution for other people's games
export async function updateGame(req, res) {
    try {
        // fetch first so we can check the players list before applying the update
        const currentGame = await gameService.getGame(req.params.gid);
        if (!currentGame) return res.status(404).json({ error: "Game not found" });

        const isAdmin = req.user?.type === "admin";
        const isPlayer = currentGame.players.some(player => (player._id || player).toString() === req.user?.id);
        if (!isAdmin && !isPlayer) {
            return res.status(403).json({ error: "You are not a player in this game" });
        }

        const game = await gameService.updateGame(req.params.gid, req.body);
        res.status(200).json(gameService.sanitizeGameForViewer(game, req.user?.id));
    } catch (err) {
        sendError(res, err);
    }
}

export async function rollForPlayer(req, res) {
    try {
        const game = await gameService.rollForPlayer(req.params.gid, req.user.id, req.body.heldIndexes ?? []);
        if (!game) return res.status(404).json({ error: "Game not found" });

        const populatedGame = await gameService.getGame(req.params.gid);
        res.status(200).json(gameService.sanitizeGameForViewer(populatedGame, req.user?.id));
    } catch(err) {
        const status = statusFromMessage(err.message, [
            { text: "not a player", status: 403 },
            { text: "not your turn", status: 403 },
            { text: "used all your rolls", status: 400 },
            { text: "not currently rolling", status: 400 }
        ]);

        sendError(res, err, status);
    }
}

export async function placeBet(req, res) {
    try {
        const game = await gameService.placeBet(req.params.gid, req.user.id, req.body);

        if (!game) return res.status(404).json({ error: "Game not found" });

        const populatedGame = await gameService.getGame(req.params.gid);
        res.status(200).json(gameService.sanitizeGameForViewer(populatedGame, req.user?.id));
    } catch (err) {
        const status = statusFromMessage(err.message, [
            { text: "not a player", status: 403 },
            { text: "not your turn", status: 403 },
            { text: "already folded", status: 400 },
            { text: "not currently accepting bets", status: 400 },
            { text: "Not enough", status: 400 },
            { text: "Invalid", status: 400 }
        ]);

        sendError(res, err, status);
    }
}

export async function handleTimeout(req, res) {
    try {
        const game = await gameService.handleTimeout(req.params.gid);
        if (!game) return res.status(404).json({ error: "Game not found" });

        const populatedGame = await gameService.getGame(req.params.gid);
        res.status(200).json(gameService.sanitizeGameForViewer(populatedGame, req.user?.id));
    } catch(err) {
        const status = statusFromMessage(err.message, [
            { text: "not expired", status: 400 },
            { text: "No active turn", status: 400 },
            { text: "Only ongoing", status: 400 },
            { text: "cannot time out", status: 400 }
        ]);

        sendError(res, err, status);
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
    updateGame,
    rollForPlayer,
    placeBet,
    handleTimeout
};
