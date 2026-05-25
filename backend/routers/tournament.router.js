import express from "express";
import tournamentController, { leaveTournament, getTournamentStandings, deleteTournament } from "../controllers/tournament.controller.js";
import commentController from "../controllers/comment.controller.js";
import { validateCreateTournament, validateUpdateTournament, validateJoinTournament, handleValidationErrors } from "../validators/tournament.validator.js";
import { requireAdmin, requireUser, requireNotBanned } from "../middleware/auth.middleware.js";

// Tournament router, handles all /tournaments endpoints
const tournamentRouter = express.Router();


//Assigning handlers to routes
// Gets all Tournaments
tournamentRouter.get("/tournaments", tournamentController.getAllTournaments);

// Gets a single Tournament by ID
tournamentRouter.get("/tournaments/:tid", tournamentController.getTournament);

// Creates a new Tournament (admin only)
tournamentRouter.post("/tournaments", requireAdmin, validateCreateTournament, handleValidationErrors, tournamentController.createTournament);

// Updating a Tournament (admin only)
tournamentRouter.put("/tournaments/:tid", requireAdmin, validateUpdateTournament, handleValidationErrors, tournamentController.updateTournament);

// Adds a player to a tournament (must be logged in)
tournamentRouter.patch("/tournaments/:tid/join", requireUser, requireNotBanned, validateJoinTournament, handleValidationErrors, tournamentController.joinTournament);

// Starts a tournament: shuffles players and creates round 1 (admin only)
tournamentRouter.patch("/tournaments/:tid/start", requireAdmin, tournamentController.startTournament);

// Leave a tournament (must be logged in, only while upcoming)
tournamentRouter.patch("/tournaments/:tid/leave", requireUser, leaveTournament);

// Get standings - arena: sorted arenaScores, knockout: rounds array
tournamentRouter.get("/tournaments/:tid/standings", getTournamentStandings);

// Delete a tournament (admin only, only pending/upcoming)
tournamentRouter.delete("/tournaments/:tid", requireAdmin, deleteTournament);

// Gets all comments for a specific tournament
tournamentRouter.get("/tournaments/:tid/comments", commentController.getCommentsByTournament);

// Export the router so it can be registered in app.js
export default tournamentRouter;