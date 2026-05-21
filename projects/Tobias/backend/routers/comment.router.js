import express from "express";
import commentController from "../controllers/comment.controller.js";
import commentValidator from "../validators/comment.validator.js";
import matchValidator from "../validators/match.validator.js";
import tournamentValidator from "../validators/tournament.validator.js";
import { validate } from "../middleware/validate.js";
import { requireAdmin, requireUser } from "../middleware/auth.js";

const commentRouter = express.Router();

// get all comments
commentRouter.get("/comments", requireAdmin, commentController.getAllComments);

// leave comment on match
commentRouter.post("/matches/:mid/comments", 
    matchValidator.validateMid(),
    commentValidator.validateComment(),
    requireUser,
    validate, 
    commentController.leaveMatchComment
)

// leave comment on tournament
commentRouter.post("/tournaments/:tid/comments", 
    tournamentValidator.validateTid(),
    commentValidator.validateComment(),
    requireUser,
    validate, 
    commentController.leaveTournamentComment
)

// delete comment from match
commentRouter.delete("/matches/:mid/comments/:cid", 
    matchValidator.validateMid(),
    commentValidator.validateCid(),
    requireAdmin,
    validate, 
    commentController.deleteMatchComment
)

// delete comment from tournament
commentRouter.delete("/tournaments/:tid/comments/:cid", 
    tournamentValidator.validateTid(),
    commentValidator.validateCid(),
    requireAdmin,
    validate, 
    commentController.deleteTournamentComment
)

// added this in Oblig 3
commentRouter.get("/matches/:mid/comments", 
    matchValidator.validateMid(),
    validate,
    commentController.getMatchComments
);

export default commentRouter;