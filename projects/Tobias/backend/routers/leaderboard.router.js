import express from "express";
import leaderboardController from "../controllers/leaderboard.controller.js";
import { validate } from "../middleware/validate.js";

const leaderboardRouter = express.Router();

// get all leaderboards
leaderboardRouter.get("/", leaderboardController.getAllLeaderboards);

// get leaderboard by wins
leaderboardRouter.get("/wins", 
    leaderboardController.getLeaderboardByWins,
    validate
);

// get leaderboards by matches
leaderboardRouter.get("/matches", 
    leaderboardController.getLeaderboardByMatches,
    validate
);

// get leaderboards by win percentage
leaderboardRouter.get("/winPercentage", 
    leaderboardController.getLeaderboardByWinPercentage,
    validate
);

export default leaderboardRouter;

