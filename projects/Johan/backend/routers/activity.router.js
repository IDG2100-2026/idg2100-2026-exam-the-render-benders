import express from "express";
import activityController from "../controllers/activity.controller.js";

// Activity router, handles the /activity endpoint
const activityRouter = express.Router();

// Gets platform-wide activity stats (ongoing games, active users this week, last 10 games)
activityRouter.get("/activity", activityController.getActivity);

// Export the router so it can be registered in app.js
export default activityRouter;
