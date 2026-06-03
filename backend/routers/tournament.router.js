import express from "express";
import tournamentController, { leaveTournament, getTournamentStandings, deleteTournament } from "../controllers/tournament.controller.js";
import commentController from "../controllers/comment.controller.js";
import { validateCreateTournament, validateUpdateTournament, validateJoinTournament, handleValidationErrors } from "../validators/tournament.validator.js";
import { requireAdmin, requireUser, requireNotBanned, requireEmailVerified } from "../middleware/auth.middleware.js";

const tournamentRouter = express.Router();


tournamentRouter.get("/tournaments", tournamentController.getAllTournaments);

tournamentRouter.get("/tournaments/upcoming", tournamentController.getUpcomingTournaments);

tournamentRouter.get("/tournaments/:tid", tournamentController.getTournament);

tournamentRouter.post("/tournaments", requireAdmin, validateCreateTournament, handleValidationErrors, tournamentController.createTournament);

tournamentRouter.put("/tournaments/:tid", requireAdmin, validateUpdateTournament, handleValidationErrors, tournamentController.updateTournament);

tournamentRouter.patch("/tournaments/:tid/join", requireUser, requireNotBanned, requireEmailVerified, validateJoinTournament, handleValidationErrors, tournamentController.joinTournament);

tournamentRouter.patch("/tournaments/:tid/start", requireAdmin, tournamentController.startTournament);

tournamentRouter.patch("/tournaments/:tid/leave", requireUser, leaveTournament);

tournamentRouter.get("/tournaments/:tid/standings", getTournamentStandings);

tournamentRouter.delete("/tournaments/:tid", requireAdmin, deleteTournament);

tournamentRouter.get("/tournaments/:tid/comments", commentController.getCommentsByTournament);

export default tournamentRouter;