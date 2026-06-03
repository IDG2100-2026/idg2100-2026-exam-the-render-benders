import express from "express";
import userController from "../controllers/user.controller.js";
import { validateCreateUser, validateUpdateUser, handleValidationErrors } from "../validators/user.validator.js";
import { uploadProfileImage } from "../middleware/upload.middleware.js";
import { requireAdmin, requireSelfOrAdmin } from "../middleware/auth.middleware.js";

const userRouter = express.Router();

userRouter.get("/users", requireAdmin, userController.getAllUsers);
userRouter.get("/users/:username/games", userController.getUserGames);
userRouter.get("/users/:username", userController.getUser);

userRouter.post("/users", validateCreateUser, handleValidationErrors, userController.createUser);

userRouter.patch("/users/:username", requireSelfOrAdmin, uploadProfileImage, validateUpdateUser, handleValidationErrors, userController.updateUser);

userRouter.patch("/users/:username/ban", requireAdmin, userController.banUser);

userRouter.patch("/users/:username/preferences", requireSelfOrAdmin, userController.updatePreferences);

userRouter.get("/users/:username/trophies", userController.getUserTrophies);

userRouter.get("/leaderboard", userController.getLeaderboard);

export default userRouter;