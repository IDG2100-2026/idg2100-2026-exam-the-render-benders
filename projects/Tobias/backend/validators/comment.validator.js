import { body, param } from "express-validator";
import { checkCommentExistence } from "../services/comment.services.js";
import { checkUserExistence } from "../services/user.services.js";

export function validateComment(){
    return [
        body("uid")
            .isInt({ min: 1, max: Number.MAX_SAFE_INTEGER}).withMessage("User IDs must be bigger than 0")
            .bail()
            .toInt()
            .custom(checkUserExistence).withMessage("User does not exist"),
        body("text")
            .trim()
            .isString().withMessage("Comment must be text")
            .notEmpty().withMessage("Text is required")
    ]
}

export function validateCid(){
    return [
        param("cid")
            .isInt({ min: 1, max: Number.MAX_SAFE_INTEGER}).withMessage("Comment IDs must be bigger than 0")
            .bail()
            .toInt()
            .custom(checkCommentExistence).withMessage("Comment does not exist")
    ]
}

export default {
    validateComment,
    validateCid
}
