import express from "express";
import tournamentController from "../controllers/tournament.controller.js";
import commentController from "../controllers/comment.controller.js";
import { validateCreateTournament, validateUpdateTournament, validateJoinTournament, handleValidationErrors } from "../validators/tournament.validator.js";
import { uploadTrophy } from "../middleware/upload.middleware.js";

// Tournament router, handles all /tournaments endpoints
const tournamentRouter = express.Router();


//Assigning handlers to routes
// Gets all Tournaments
tournamentRouter.get("/tournaments", tournamentController.getAllTournaments);

// Gets a single Tournament by ID
tournamentRouter.get("/tournaments/:tid", tournamentController.getTournament);

// Creates a new Tournament
tournamentRouter.post("/tournaments", uploadTrophy, validateCreateTournament, handleValidationErrors, tournamentController.createTournament);

// Updating a Tournament
tournamentRouter.put("/tournaments/:tid", validateUpdateTournament, handleValidationErrors, tournamentController.updateTournament);

// Adds a player to a tournament
tournamentRouter.patch("/tournaments/:tid/join", validateJoinTournament, handleValidationErrors, tournamentController.joinTournament);

// Starts a tournament: randomly pairs players into a bracket (admin only)
tournamentRouter.patch("/tournaments/:tid/start", tournamentController.startTournament);

// Gets all comments for a specific tournament
tournamentRouter.get("/tournaments/:tid/comments", commentController.getCommentsByTournament);

// Catch Multer errors (e.g. non-image file uploaded as trophy)
// eslint-disable-next-line no-unused-vars
tournamentRouter.use((err, req, res, next) => {
    if (err.message === "Only image files are allowed") {
        return res.status(400).json({ error: err.message });
    }
    next(err);
});

// Export the router so it can be registered in app.js
export default tournamentRouter;