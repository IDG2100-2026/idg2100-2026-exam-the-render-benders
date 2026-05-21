import { body, validationResult } from "express-validator";

export const validateCreateTournament = [
    body("name")
        .isString()
        .notEmpty()
        .withMessage("Tournament name is required"),

    body("format")
        .isIn(["single-elimination", "round-robin"])
        .withMessage("Format must be single-elimination or round-robin"),

    body("description")
        .optional()
        .isString()
        .withMessage("Description must be a string"),

    body("startDate")
        .optional()
        .isISO8601()
        .withMessage("startDate must be a valid ISO 8601 date (e.g. 2026-04-10T18:00:00Z)"),

    // Optional - game variant for the tournament matches
    body("variant.rounds")
        .optional()
        .isIn([3, 5, 7])
        .withMessage("Rounds must be 3, 5 or 7"),

    body("variant.rules")
        .optional()
        .isIn(["straights-allowed", "no-straights"])
        .withMessage("Rules must be 'straights-allowed' or 'no-straights'"),

    body("variant.timeControl")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Time control must be a positive number (seconds per round)")
];

export const validateUpdateTournament = [
    body("status")
        .optional()
        .isIn(["upcoming", "ongoing", "finished"])
        .withMessage("Status must be 'upcoming', 'ongoing', or 'finished'"),
    body("winner")
        .optional()
        .isMongoId()
        .withMessage("Winner must be a valid user ID"),
    body("format")
        .optional()
        .isIn(["single-elimination", "round-robin"])
        .withMessage("Format must be 'single-elimination' or 'round-robin'")
];

export const validateJoinTournament = [
    body("player")
        .isMongoId()
        .withMessage("Player must be a valid user ID")
];

// Checks if any validation errors were found and returns 400 if so, otherwise passes to the next handler
export function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}