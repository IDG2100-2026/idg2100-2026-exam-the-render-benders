import express from "express";
import commentController from "../controllers/comment.controller.js";
import { validateCreateComment, validateUpdateComment, handleValidationErrors } from "../validators/comment.validator.js";

// Comment router, handles all /comments endpoints
const commentRouter = express.Router();

// Assigning handlers to routes
// Gets all the comments
commentRouter.get("/comments", commentController.getAllComments);

// Gets a specific comment
commentRouter.get("/comments/:cid", commentController.getComment);

// Creates a new comment
commentRouter.post("/comments", validateCreateComment, handleValidationErrors, commentController.createComment);

// Updates a comment
commentRouter.put("/comments/:cid", validateUpdateComment, handleValidationErrors, commentController.updateComment);

// Deletes a comment
commentRouter.delete("/comments/:cid", commentController.deleteComment);

// Export the router so it can be registered in app.js
export default commentRouter;