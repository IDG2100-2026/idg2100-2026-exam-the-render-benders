import express from "express";
import queueController from "../controllers/queue.controller.js";
import { validateCreateQueue, validateUpdateQueue, handleValidationErrors } from "../validators/queue.validator.js";


// Queue router, handles all /queues endpoints
const queueRouter = express.Router();

// Assigning handlers to routes
// Gets all the queues
queueRouter.get("/queues", queueController.getAllQueues);

// Gets a specific queue
queueRouter.get("/queues/:qid", queueController.getQueue);

// Creates a new queue
queueRouter.post("/queues", validateCreateQueue, handleValidationErrors, queueController.createQueue);

// Updates a queue
queueRouter.put("/queues/:qid", validateUpdateQueue, handleValidationErrors, queueController.updateQueue);

// Deletes a queue
queueRouter.delete("/queues/:qid", queueController.deleteQueue);

// Export the router so it can be registered in app.js
export default queueRouter;