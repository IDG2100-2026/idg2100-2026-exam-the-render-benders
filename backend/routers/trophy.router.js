import express from "express";
import trophyController from "../controllers/trophy.controller.js";
import { validateCreateTrophy, handleValidationErrors } from "../validators/trophy.validator.js";
import { requireAdmin } from "../middleware/auth.middleware.js";
import { uploadTrophy } from "../middleware/upload.middleware.js";
import { sendError } from "../utils/controllerHelpers.js";

const trophyRouter = express.Router();

trophyRouter.get("/trophies", trophyController.getAllTrophies);
trophyRouter.get("/trophies/:tid", trophyController.getTrophy);
trophyRouter.post("/trophies", requireAdmin, uploadTrophy, validateCreateTrophy, handleValidationErrors, trophyController.createTrophy);
trophyRouter.delete("/trophies/:tid", requireAdmin, trophyController.deleteTrophy);

trophyRouter.use((err, req, res, next) => {
    if (err.message === "Only image files are allowed") {
        return sendError(res, err, 400);
    }
    next(err);
});

export default trophyRouter;
