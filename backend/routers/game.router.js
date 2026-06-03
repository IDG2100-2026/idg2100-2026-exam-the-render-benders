import express from "express";
import gameController from "../controllers/game.controller.js";
import commentController from "../controllers/comment.controller.js";
import { validateCreateGame, validateUpdateGame, validateJoinGame, handleValidationErrors, validateBet, validateRoll } from "../validators/game.validator.js";
import { requireUser, requireNotBanned, requireEmailVerified } from "../middleware/auth.middleware.js";

const gameRouter = express.Router();

gameRouter.get("/games", gameController.getAllGames);

gameRouter.get("/games/top", gameController.getTopGames);

gameRouter.get("/games/:gid", gameController.getGame);

gameRouter.get("/games/:gid/state", gameController.getGameState);

gameRouter.post("/games", requireUser, requireNotBanned, requireEmailVerified, validateCreateGame, handleValidationErrors, gameController.createGame);

gameRouter.put("/games/:gid", requireUser, validateUpdateGame, handleValidationErrors, gameController.updateGame);

gameRouter.post("/games/:gid/players", requireUser, requireNotBanned, requireEmailVerified, validateJoinGame, handleValidationErrors, gameController.joinGame);

gameRouter.delete("/games/:gid/players/:uid", requireUser, gameController.leaveGame);

gameRouter.post("/games/:gid/bets", requireUser, requireNotBanned, requireEmailVerified, validateBet, handleValidationErrors, gameController.placeBet);

gameRouter.post("/games/:gid/timeout", requireUser, gameController.handleTimeout);

gameRouter.post("/games/:gid/roll", requireUser, validateRoll, handleValidationErrors, gameController.rollForPlayer);

gameRouter.get("/games/:gid/comments", commentController.getCommentsByGame);

export default gameRouter;