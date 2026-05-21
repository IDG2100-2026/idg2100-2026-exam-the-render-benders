import express from "express";
import commentController from "../controllers/comment.controller.js";
import { validateCreateComment, validateUpdateComment, handleValidationErrors } from "../validators/comment.validator.js";
import { requireUser } from "../middleware/auth.middleware.js";

// Comment router, handles all /comments endpoints
const commentRouter = express.Router();

// Assigning handlers to routes
// Gets all the comments
commentRouter.get("/comments", commentController.getAllComments);

// Gets a specific comment
commentRouter.get("/comments/:cid", commentController.getComment);

// Creates a new comment (must be logged in)
commentRouter.post("/comments", requireUser, validateCreateComment, handleValidationErrors, commentController.createComment);

// Updates a comment (must be logged in)
commentRouter.put("/comments/:cid", requireUser, validateUpdateComment, handleValidationErrors, commentController.updateComment);

// Deletes a comment (must be logged in)
commentRouter.delete("/comments/:cid", requireUser, commentController.deleteComment);

// Export the router so it can be registered in app.js
export default commentRouter;