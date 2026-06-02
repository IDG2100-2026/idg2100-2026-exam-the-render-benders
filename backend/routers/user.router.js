import express from "express";
import userController from "../controllers/user.controller.js";
import { validateCreateUser, validateUpdateUser, handleValidationErrors } from "../validators/user.validator.js";
import { uploadProfileImage } from "../middleware/upload.middleware.js";
import { requireAdmin, requireSelfOrAdmin } from "../middleware/auth.middleware.js";

// User router, handles all /users endpoints
const userRouter = express.Router();

// Assigning handlers to routes
// Gets all users (admin only)
userRouter.get("/users", requireAdmin, userController.getAllUsers);
// Gets a single users games
userRouter.get("/users/:username/games", userController.getUserGames);
// Gets a single user by username
userRouter.get("/users/:username", userController.getUser);

// Creates a new user
userRouter.post("/users", validateCreateUser, handleValidationErrors, userController.createUser);

// Updating the user (only that user or admin)
userRouter.patch("/users/:username", requireSelfOrAdmin, uploadProfileImage, validateUpdateUser, handleValidationErrors, userController.updateUser);

// Banning a user (admin only)
userRouter.patch("/users/:username/ban", requireAdmin, userController.banUser);

// Update appearance preferences for a user (only that user or admin)
userRouter.patch("/users/:username/preferences", requireSelfOrAdmin, userController.updatePreferences);

// Get trophies for a user
userRouter.get("/users/:username/trophies", userController.getUserTrophies);

// Get leaderboard, sorted by ELO
userRouter.get("/leaderboard", userController.getLeaderboard);

// Export the router so it can be registered in app.js
export default userRouter;