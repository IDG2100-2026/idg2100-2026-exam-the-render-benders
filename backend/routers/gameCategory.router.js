import express from "express";
import gameCategoryController from "../controllers/gameCategory.controller.js";
import { validateCreateGameCategory, validateUpdateGameCategory, handleValidationErrors } from "../validators/gameCategory.validator.js";
import { requireAdmin } from "../middleware/auth.middleware.js";

const gameCategoryRouter = express.Router();

gameCategoryRouter.get("/game-categories", gameCategoryController.getAllGameCategories);
gameCategoryRouter.get("/game-categories/by-name", gameCategoryController.getGameCategoryByName);
gameCategoryRouter.get("/game-categories/:gcid", gameCategoryController.getGameCategory);
gameCategoryRouter.post("/game-categories", requireAdmin, validateCreateGameCategory, handleValidationErrors, gameCategoryController.createGameCategory);
gameCategoryRouter.patch("/game-categories/:gcid", requireAdmin, validateUpdateGameCategory, handleValidationErrors, gameCategoryController.updateGameCategory);
gameCategoryRouter.delete("/game-categories/:gcid", requireAdmin, gameCategoryController.deleteGameCategory);

export default gameCategoryRouter;
