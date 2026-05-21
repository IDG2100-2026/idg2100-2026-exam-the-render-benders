import express from "express";
import userRouter from "./user.router.js";
import matchRouter from "./match.router.js";
import tournamentRouter from "./tournament.router.js";
import commentRouter from "./comment.router.js";
import leaderboardRouter from "./leaderboard.router.js";
import activityRouter from "./activity.router.js";

const apiV1Router = express.Router();

// There will be too much in this file, so I decided to have them in separate files
// and retrieve them here
apiV1Router.use("/users", userRouter);
apiV1Router.use("/matches", matchRouter);
apiV1Router.use("/tournaments", tournamentRouter);
apiV1Router.use("/", commentRouter);
apiV1Router.use("/leaderboards", leaderboardRouter);
apiV1Router.use("/activity", activityRouter);

export default apiV1Router;