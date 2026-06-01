import { body } from "express-validator";
import { GAME_TIME_CONTROLS } from "../config/constants.js";
export { handleValidationErrors } from "../utils/handleValidationErrors.js";

export const validateCreateGameCategory = [
    body("name")
        .isString()
        .notEmpty()
        .withMessage("Name is required"),
    body("numOfRounds")
        .isIn([3, 5, 7])
        .withMessage("numOfRounds must be 3, 5 or 7"),
    body("straightsAllowed")
        .isBoolean()
        .withMessage("straightsAllowed must be true or false"),
    body("timePerRound")
        .isIn(GAME_TIME_CONTROLS)
        .withMessage(`timePerRound must be one of ${GAME_TIME_CONTROLS.join(", ")}`)
];

export const validateUpdateGameCategory = [
    body("name")
        .optional()
        .isString()
        .notEmpty()
        .withMessage("Name must be a non-empty string"),
    body("numOfRounds")
        .optional()
        .isIn([3, 5, 7])
        .withMessage("numOfRounds must be 3, 5 or 7"),
    body("straightsAllowed")
        .optional()
        .isBoolean()
        .withMessage("straightsAllowed must be true or false"),
    body("timePerRound")
        .optional()
        .isIn(GAME_TIME_CONTROLS)
        .withMessage(`timePerRound must be one of ${GAME_TIME_CONTROLS.join(", ")}`)
];
