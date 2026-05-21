import express from "express";
import userController from "../controllers/user.controller.js";
import { validateCreateUser, validateUpdateUser, handleValidationErrors } from "../validators/user.validator.js";
import { uploadProfileImage } from "../middleware/upload.middleware.js";
import { requireAdmin } from "../middleware/auth.middleware.js";

// User router, handles all /users endpoints
const userRouter = express.Router();

// Assigning handlers to routes
// Gets all users
userRouter.get("/users", userController.getAllUsers);

// Gets a single user by username
userRouter.get("/users/:username", userController.getUser);

// Creates a new user
userRouter.post("/users", validateCreateUser, handleValidationErrors, userController.createUser);

// Updating a user — only the user themselves or an admin can update a profile
function requireSelfOrAdmin(req, res, next) {
    if (req.user?.type === "admin") return next();
    if (req.user?.type === "user" && req.params.username) return next();
    return res.status(403).json({ error: "You can only update your own profile" });
}
userRouter.patch("/users/:username", requireSelfOrAdmin, uploadProfileImage, validateUpdateUser, handleValidationErrors, userController.updateUser);

// Banning a user (admin only)
userRouter.patch("/users/:username/ban", requireAdmin, userController.banUser);

// Update appearance preferences for a user
userRouter.patch("/users/:username/preferences", userController.updatePreferences);

// Get trophies for a user
userRouter.get("/users/:username/trophies", userController.getUserTrophies);

// Get leaderboard, sorted by ELO
userRouter.get("/leaderboard", userController.getLeaderboard);

// Login a user, checks username and password
userRouter.post("/users/login", userController.loginUser);

// Export the router so it can be registered in app.js
export default userRouter;