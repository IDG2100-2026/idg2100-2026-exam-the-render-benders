import { body } from "express-validator";
export { handleValidationErrors } from "../utils/handleValidationErrors.js";

export const validateCreateQueue = [
    body("player")
        .isMongoId()
        .withMessage("Player must be a valid user ID"),

    body("elo")
        .isInt({ min: 0 })
        .withMessage("ELO must be a positive number")
];

export const validateUpdateQueue = [
    body("status")
        .optional()
        .isIn(["waiting", "matched"])
        .withMessage("Status must be 'waiting' or 'matched'")
];
