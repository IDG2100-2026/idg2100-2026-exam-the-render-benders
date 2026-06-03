import express from "express";
import queueController from "../controllers/queue.controller.js";
import { validateCreateQueue, validateUpdateQueue, handleValidationErrors } from "../validators/queue.validator.js";


const queueRouter = express.Router();

queueRouter.get("/queues", queueController.getAllQueues);

queueRouter.get("/queues/:qid", queueController.getQueue);

queueRouter.post("/queues", validateCreateQueue, handleValidationErrors, queueController.createQueue);

queueRouter.put("/queues/:qid", validateUpdateQueue, handleValidationErrors, queueController.updateQueue);

queueRouter.delete("/queues/:qid", queueController.deleteQueue);

export default queueRouter;