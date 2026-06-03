import express from "express";
import activityController from "../controllers/activity.controller.js";

const activityRouter = express.Router();

activityRouter.get("/activity", activityController.getActivity);

export default activityRouter;
