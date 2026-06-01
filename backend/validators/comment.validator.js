import { body } from "express-validator";
import { MAX_COMMENT_LENGTH } from "../config/constants.js";
export { handleValidationErrors } from "../utils/handleValidationErrors.js";

export const validateCreateComment = [
    body("body")
    .isString()
    .notEmpty()
    .withMessage("Comment body is required")
    .isLength({ max: MAX_COMMENT_LENGTH })
    .withMessage(`Comment cannot exceed ${MAX_COMMENT_LENGTH} characters`),

    body("author")
    .isMongoId()
    .withMessage("Author must be a valid user ID"),

    body("game")
    .optional()
    .isMongoId()
    .withMessage("Game must be a valid game ID"),

    body("tournament")
    .optional()
    .isMongoId()
    .withMessage("Tournament must be a valid tournament ID"),

    // At least one of game or tournament must be provided
    body().custom((value) => {
        if (!value.game && !value.tournament) {
            throw new Error("A comment must be linked to a game or a tournament");
        }
        return true;
    })
];

export const validateUpdateComment = [
    body("body")
        .optional()
        .isString()
        .notEmpty()
        .withMessage("Comment body must be a non-empty string")
];
