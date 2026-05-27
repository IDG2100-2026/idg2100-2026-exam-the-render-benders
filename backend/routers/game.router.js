import express from "express";
import gameController from "../controllers/game.controller.js";
import commentController from "../controllers/comment.controller.js";
import { validateCreateGame, validateUpdateGame, validateJoinGame, handleValidationErrors, validateBet } from "../validators/game.validator.js";
import { requireUser, requireNotBanned, requireEmailVerified } from "../middleware/auth.middleware.js";

// Game router, handles all /games endpoints
const gameRouter = express.Router();

// Assigning handlers to routes
// Gets all the games
gameRouter.get("/games", gameController.getAllGames);

// Gets the top 5 games by average Elo
gameRouter.get("/games/top", gameController.getTopGames);

// Gets a specific game
gameRouter.get("/games/:gid", gameController.getGame);

// Gets the current state of a game (used for reload/navigation restoring)
gameRouter.get("/games/:gid/state", gameController.getGameState);

// Creates a new game (start matchmaking)
gameRouter.post("/games", requireUser, validateCreateGame, handleValidationErrors, gameController.createGame);

// Updates a game (saves the result when finished)
gameRouter.put("/games/:gid", requireUser, validateUpdateGame, handleValidationErrors, gameController.updateGame);

// POST /games/:gid/players - join a game (add yourself as a player)
gameRouter.post("/games/:gid/players", requireUser, requireNotBanned, requireEmailVerified, validateJoinGame, handleValidationErrors, gameController.joinGame);

// DELETE /games/:gid/players/:uid - leave a game (remove yourself; forfeits if ongoing)
gameRouter.delete("/games/:gid/players/:uid", requireUser, gameController.leaveGame);

// POST /games/:gid/bets - Betting
gameRouter.post("/games/:gid/bets", requireUser, requireNotBanned, requireEmailVerified, validateBet, handleValidationErrors, gameController.placeBet);

// POST /games/:gid/timeout - Timeout
gameRouter.post("/games/:gid/timeout", requireUser, gameController.handleTimeout);

// POST /games/:gid/roll - backend generates dice for the logged in player
gameRouter.post("/games/:gid/roll", requireUser, gameController.rollForPlayer);

// Gets all comments for a specific game
gameRouter.get("/games/:gid/comments", commentController.getCommentsByGame);

// Export the router so it can be registered in app.js
export default gameRouter;