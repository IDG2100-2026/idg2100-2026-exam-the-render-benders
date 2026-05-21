import { checkIfUsernameExists, checkIfEmailExists, checkUserExistence } from "../services/user.services.js";
import { body, param } from "express-validator";

export function validateUser(){
    return [
        body("username")
            .trim()
            .escape()
            .isAlphanumeric().withMessage("Username must be made of alpha numerical characters!")
            .isLength({ min: 4 }).withMessage("Username must be minimum 4 characters.")
            .bail()
            .custom(username => checkIfUsernameExists(username)).withMessage("Username already exists"),
        body("email")
            .trim()
            .escape()
            .isEmail().withMessage("That is not a valid email.")
            .bail()
            .custom(email => checkIfEmailExists(email)).withMessage("Email is already in use"),
        body("age")
            .isInt({ min: 18 }).withMessage("You must be at least 18 years old to register")
            .bail(),
        body("pwd")
            .trim()
            .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
            .withMessage("The password must be minimum 8 characters and include at least one of each of these: numbers, symbols, lower and uppercase")
    ];
}

export function validateUid(){
    return [
        param("uid")
            .isInt({ min: 1, max: Number.MAX_SAFE_INTEGER }).withMessage("User IDs must be integers bigger than 0")
            .bail() // if the validation chain fail, we quit
            .toInt() // follow up functions will receive uid as integer
            .custom(checkUserExistence)
        ];
}

export function validateLogin(){
    return [
        body("username")
            .trim()
            .notEmpty().withMessage("Username is required"),
        body("pwd")
            .trim()
            .notEmpty().withMessage("Password is required")
    ];
}

export function validateUserUpdate(){
    return [
        body("email")
            .optional()
            .trim()
            .escape()
            .isEmail().withMessage("That is not a valid email")
            .bail()
            .custom(email => checkIfEmailExists(email)).withMessage("Email is already in use"),
        body("age")
            .optional()
            .isInt({ min: 18 }).withMessage("You must be at least 18 years old"),
        body("aboutMe")
            .optional()
            .trim()
            .escape(),
        body("pwd")
            .optional()
            .trim()
            .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
            .withMessage("Password must be at least 8 characters with numbers, symbols, upper and lowercase"),
        body("appearance.darkMode")
            .optional()
            .isBoolean(),
        body("appearance.boardColor")
            .optional()
            .trim()
            .isString(),
        body("appearance.soundOn")
            .optional()
            .isBoolean(),
        body("appearance.lobbyCount")
            .optional()
            .isInt({ min: 1, max: 10 })
    ];
}

export default { 
    validateUser,
    validateUid,
    validateLogin,
    validateUserUpdate
};