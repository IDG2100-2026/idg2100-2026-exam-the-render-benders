import { body, validationResult } from "express-validator";
import { MAX_ELO, GAME_PLAYER_COUNTS, GAME_BUY_INS } from "../config/constants.js";

// Validates the body when creating a new game
export const validateCreateGame = [
    body("players")
        .isArray({ min: 1 })
        .withMessage("Players must be an array with at least 1 player"),

    // Validates that each player in the array is a valid MongoDB ID
    body("players.*")
        .isMongoId()
        .withMessage("Each player must be a valid user ID"),

    body("variant.rounds")
        .isIn([3, 5, 7])
        .withMessage("Rounds must be 3, 5 or 7"),

    body("variant.timeControl")
        .isIn([10, 30, 90])
        .withMessage("Time control must be 10, 30 or 90"),

    // Rules default to "straights-allowed" in the model - validator only runs when the field is present
    body("variant.rules")
        .optional()
        .isIn(["straights-allowed", "no-straights"])
        .withMessage("Rules must be 'straights-allowed' or 'no-straights'"),

    // Optional - only registered users can restrict anonymous players
    body("allowAnonymous")
        .optional()
        .isBoolean()
        .withMessage("allowAnonymous must be true or false"),

    // Optional - the creator's desired opponent Elo rating
    body("desiredElo")
        .optional()
        .isInt({ min: 0, max: MAX_ELO })
        .withMessage(`desiredElo must be between 0 and ${MAX_ELO}`),

    // Optional - Validate number of players
    body("numPlayers")
        .optional()
        .isInt()
        .toInt()
        .isIn(GAME_PLAYER_COUNTS)
        .withMessage(`numPlayers must be one of: ${GAME_PLAYER_COUNTS.join(", ")}`),

    // Optional - Validate buy-ins
    body("buyIn")
        .optional()
        .isInt()
        .toInt()
        .isIn(GAME_BUY_INS)
        .withMessage(`buyIn must be one  of: ${GAME_BUY_INS.join(", ")}`)
];

// Validates the body when updating an existing game - all fields are optional
export const validateUpdateGame = [
    body("status")
        .optional()
        .isIn(["waiting", "ongoing", "finished"])
        .withMessage("Status must be 'waiting', 'ongoing' or 'finished'"),
    body("result.winner")
        .optional()
        .isMongoId()
        .withMessage("Winner must be a valid user ID")
];

// Validates the body when a player joins a game
export const validateJoinGame = [
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

export const validateBet = [
    body("action")
        .isIn(["bet", "match", "raise", "fold"])
        .withMessage("Action must be bet, match, raise or fold"),

    body("amount")
        .optional()
        .isInt({ min: 0 })
        .toInt()
        .withMessage("Amount must be a positive integer")
];