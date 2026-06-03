import { body } from "express-validator";
import { MAX_ELO, GAME_PLAYER_COUNTS, GAME_BUY_INS } from "../config/constants.js";
export { handleValidationErrors } from "../utils/handleValidationErrors.js";

export const validateCreateGame = [
    body("players")
        .isArray({ min: 1 })
        .withMessage("Players must be an array with at least 1 player"),

    body("players.*")
        .isMongoId()
        .withMessage("Each player must be a valid user ID"),

    body("variant.rounds")
        .isIn([3, 5, 7])
        .withMessage("Rounds must be 3, 5 or 7"),

    body("variant.timeControl")
        .isIn([10, 30, 90])
        .withMessage("Time control must be 10, 30 or 90"),

    body("variant.rules")
        .optional()
        .isIn(["straights-allowed", "no-straights"])
        .withMessage("Rules must be 'straights-allowed' or 'no-straights'"),

    body("allowAnonymous")
        .optional()
        .isBoolean()
        .withMessage("allowAnonymous must be true or false"),

    body("desiredElo")
        .optional()
        .isInt({ min: 0, max: MAX_ELO })
        .withMessage(`desiredElo must be between 0 and ${MAX_ELO}`),

    body("numPlayers")
        .optional()
        .isInt()
        .toInt()
        .isIn(GAME_PLAYER_COUNTS)
        .withMessage(`numPlayers must be one of: ${GAME_PLAYER_COUNTS.join(", ")}`),

    body("buyIn")
        .optional()
        .isInt()
        .toInt()
        .isIn(GAME_BUY_INS)
        .withMessage(`buyIn must be one  of: ${GAME_BUY_INS.join(", ")}`)
];

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

export const validateJoinGame = [
    body("player")
        .isMongoId()
        .withMessage("Player must be a valid user ID")
];

export const validateBet = [
    body("action")
        .isIn(["bet", "match", "raise", "fold", "check"])
        .withMessage("Action must be bet, match, raise, fold or check"),

    body("amount")
        .optional()
        .isInt({ min: 1 })
        .toInt()
        .withMessage("Amount must be a positive integer")
];

export const validateRoll = [
    body("heldIndexes")
        .optional()
        .isArray({ max: 5 })
        .withMessage("heldIndexes must be an array with up to 5 indexes")
        .bail()
        .custom((heldIndexes) => {
            const allValidIndexes = heldIndexes.every(index =>
                Number.isInteger(index) && index >= 0 && index <= 4
            );

            const hasNoDuplicates = new Set(heldIndexes).size === heldIndexes.length;
            return allValidIndexes && hasNoDuplicates;
        })
        .withMessage("heldIndexes must contain unique integers from 0 to 4")
];
