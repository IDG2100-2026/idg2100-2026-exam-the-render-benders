import express from "express";
import commentController from "../controllers/comment.controller.js";
import { validateCreateComment, validateUpdateComment, handleValidationErrors } from "../validators/comment.validator.js";
import { requireUser } from "../middleware/auth.middleware.js";

const commentRouter = express.Router();

commentRouter.get("/comments", commentController.getAllComments);

commentRouter.get("/comments/:cid", commentController.getComment);

commentRouter.post("/comments", requireUser, validateCreateComment, handleValidationErrors, commentController.createComment);

commentRouter.put("/comments/:cid", requireUser, validateUpdateComment, handleValidationErrors, commentController.updateComment);

commentRouter.delete("/comments/:cid", requireUser, commentController.deleteComment);

export default commentRouter;