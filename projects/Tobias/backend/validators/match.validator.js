import { body, param } from "express-validator";
import { checkMatchExistence } from "../services/match.services.js";
import { checkUserExistence } from "../services/user.services.js";

export function validateMatch(){
    return [
        body("rounds")
            .isInt().withMessage("Rounds must be a number")
            .bail()
            .toInt()
            .isIn([3, 5, 7]).withMessage("Rounds must be either 3, 5 or 7"),
        body("includeStraights")
            .optional()
            .isBoolean().withMessage("includeStraights must be true or false"),
        body("timeControl")
            .isInt().withMessage("timeControl must be a number")
            .bail()
            .toInt()
            .isIn([3, 10, 30]).withMessage("timeControl must be 3s, 10s or 30s"),
        body("allowAnonymous")
            .optional()
            .isBoolean().withMessage("allowAnonymous must be true or false"),
        body("eloMin")
            .optional()
            .isInt({ min: 0 }).withMessage("eloMin must be a positive number")
            .toInt(),
        body("eloMax")
            .optional()
            .isInt({ min: 0 }).withMessage("eloMax must be a positive number")
            .toInt(),
        body("uid")
            .isInt({ min: 1 }).withMessage("uid must be a valid integer")
            .bail()
            .toInt()
            .custom(checkUserExistence).withMessage("The user does not exist")
    ];
}

export function validateMid(){
    return [
        param("mid")
            .isInt({ min: 1, max: Number.MAX_SAFE_INTEGER }).withMessage("Match IDs must be bigger than 0")
            .bail()
            .toInt()
            .custom(checkMatchExistence).withMessage("Match does not exist")
    ]
}

export function validateJoin(){
    return [
        body("uid")
            .isInt({ min: 1}).withMessage("uid must be a valid integer")
            .bail()
            .toInt()
            .custom(checkUserExistence).withMessage("The user does not exist")
    ];
}

export default {
    validateMatch,
    validateMid,
    validateJoin
}