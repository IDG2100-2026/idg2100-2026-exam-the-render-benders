import { body, validationResult } from "express-validator";

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

// Checks if any validation errors were found and returns 400 if so, otherwise passes to the next handler
export function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}