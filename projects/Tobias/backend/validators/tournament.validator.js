import { body, param } from "express-validator";
import { checkTournamentExistence } from "../services/tournament.services.js";
import { checkUserExistence } from "../services/user.services.js";

export function validateTournament(){
    return [
        body("title")
            .trim()
            .isString().withMessage("Title must be text")
            .notEmpty().withMessage("Title is required"),
        body("description")
            .optional()
            .trim()
            .isString().withMessage("Description must be text"),
        body("minPlayers")
            .isInt({ min: 2 }).withMessage("Minimum players is 2"),
        body("maxPlayers")
            .isInt({ min: 2 }).withMessage("Maximum players must be at least 2"),
        body("startDateTime")
            // ISO8601 instead of isDate to include time 
            .isISO8601().withMessage("startDateTime must have format (ISO8601): YYYY-MM-DD"),
        body("rounds")
            .isInt().withMessage("Rounds must be a number")
            .bail()
            .toInt()
            .isIn([3, 5, 7]).withMessage("Rounds must be either 3, 5 or 7"),
        body("includeStraights")
            .optional()
            .isBoolean().withMessage("includeStraights must be either true or false"),
        body("timeControl")
            .isInt().withMessage("timeControl must be a number")
            .bail()
            .toInt()
            .isIn([3, 5, 7]).withMessage("timeControl must be either 3, 5 or 7")
    ]
}

export function validateTid(){
    return [
        param("tid")
            .isInt({ min: 1, max: Number.MAX_SAFE_INTEGER}).withMessage("Tournament IDs must be bigger than 0")
            .bail()
            .toInt()
            .custom(checkTournamentExistence).withMessage("Tournament does not exist")
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
    validateTournament,
    validateTid,
    validateJoin
}

