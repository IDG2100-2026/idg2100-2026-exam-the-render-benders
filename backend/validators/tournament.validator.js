import { body } from "express-validator";
export { handleValidationErrors } from "../utils/handleValidationErrors.js";

export const validateCreateTournament = [
    body("name")
        .isString()
        .notEmpty()
        .withMessage("Tournament name is required"),

    body("tournamentType")
        .isIn(["knockout", "arena"])
        .withMessage("Tournament type must be 'knockout' or 'arena'"),

    body("description")
        .optional()
        .isString()
        .withMessage("Description must be a string"),

    body("startDate")
        .optional()
        .isISO8601()
        .withMessage("startDate must be a valid ISO 8601 date (e.g. 2026-04-10T18:00:00Z)"),

    body("gameCategory")
        .optional()
        .isMongoId()
        .withMessage("gameCategory must be a valid ID"),

    body("minParticipants")
        .optional()
        .isInt({ min: 2 })
        .withMessage("minParticipants must be at least 2"),

    body("maxParticipants")
        .optional()
        .isInt({ min: 2 })
        .withMessage("maxParticipants must be at least 2"),

    body("durationMinutes")
        .optional()
        .isInt({ min: 1 })
        .withMessage("durationMinutes must be a positive number"),

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
        .isIn([10, 30, 90])
        .withMessage("Time control must be 10, 30 or 90")
];

export const validateUpdateTournament = [
    body("status")
        .optional()
        .isIn(["upcoming", "ongoing", "finished"])
        .withMessage("Status must be 'upcoming', 'ongoing', or 'finished'"),
    body("winner")
        .optional()
        .isMongoId()
        .withMessage("Winner must be a valid user ID")
];

export const validateJoinTournament = [
    body("player")
        .isMongoId()
        .withMessage("Player must be a valid user ID")
];
