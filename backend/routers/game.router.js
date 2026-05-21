import express from "express";
import gameController from "../controllers/game.controller.js";
import commentController from "../controllers/comment.controller.js";
import { validateCreateGame, validateUpdateGame, validateJoinGame, handleValidationErrors } from "../validators/game.validator.js";
import { requireUser } from "../middleware/auth.middleware.js";

// Game router, handles all /games endpoints
const gameRouter = express.Router();

// Assigning handlers to routes
// Gets all the games
gameRouter.get("/games", gameController.getAllGames);

// Gets the top 5 games by average Elo
gameRouter.get("/games/top", gameController.getTopGames);

// Gets a specific game
gameRouter.get("/games/:gid", gameController.getGame);

// Creates a new game (start matchmaking)
gameRouter.post("/games", requireUser, validateCreateGame, handleValidationErrors, gameController.createGame);

// Updates a game (saves the result when finished)
gameRouter.put("/games/:gid", requireUser, validateUpdateGame, handleValidationErrors, gameController.updateGame);

// Adds a player to a game (join from lobby)
gameRouter.patch("/games/:gid/join", validateJoinGame, handleValidationErrors, gameController.joinGame);

// Gets all comments for a specific game
gameRouter.get("/games/:gid/comments", commentController.getCommentsByGame);

// Export the router so it can be registered in app.js
export default gameRouter;