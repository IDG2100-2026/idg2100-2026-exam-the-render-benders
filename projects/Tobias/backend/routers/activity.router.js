import express from "express";
import activityController from "../controllers/activity.controller.js";

const activityRouter = express.Router();

// getting the platform activity
activityRouter.get("/", activityController.getPlatformActivity);

export default activityRouter;

