import { body, validationResult } from "express-validator";
import { MIN_USERNAME_LENGTH, MAX_USERNAME_LENGTH, MIN_PWD_LENGTH, MAX_PWD_LENGTH, MIN_AGE, MAX_AGE, MAX_BIO_LENGTH } from "../config/constants.js";

export const validateCreateUser = [
    body("username")
        .isLength({ min: MIN_USERNAME_LENGTH, max: MAX_USERNAME_LENGTH })
        .withMessage(`Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters`)
        .matches(/^[a-zA-Z0-9_À-ɏ]+$/)
        .withMessage("Username can only contain letters (including æøå), numbers and underscores"),
    body("email")
        .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)
        .withMessage("Must be a valid email"),
    body("pwd")
        .isLength({ min: MIN_PWD_LENGTH, max: MAX_PWD_LENGTH })
        .withMessage(`Password must be between ${MIN_PWD_LENGTH} and ${MAX_PWD_LENGTH} characters`)
        .isStrongPassword({ minLength: MIN_PWD_LENGTH, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
        .withMessage("Password must include at least one uppercase letter, lowercase letter, number and symbol"),
    body("dateOfBirth")
        .isISO8601()
        .withMessage("Must be a valid date")
        .custom(value => {
            const dob = new Date(value);
            const today = new Date();
            const age = today.getFullYear() - dob.getFullYear() - (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
            if (age > MAX_AGE) throw new Error(`Age cannot exceed ${MAX_AGE} years`);
            return true;
        })
];

export const validateUpdateUser = [
    body("email")
        .optional()
        .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)
        .withMessage("Must be a valid email"),
    body("pwd")
        .optional()
        .isLength({ min: MIN_PWD_LENGTH, max: MAX_PWD_LENGTH })
        .withMessage(`Password must be between ${MIN_PWD_LENGTH} and ${MAX_PWD_LENGTH} characters`),
    body("dateOfBirth")
        .optional()
        .isISO8601()
        .withMessage("Must be a valid date"),
    body("aboutMe")
        .optional()
        .isString()
        .isLength({ max: MAX_BIO_LENGTH })
        .withMessage(`About me cannot exceed ${MAX_BIO_LENGTH} characters`)
];

// Checks if any validation errors were found and returns 400 if so, otherwise passes to the next handler
export function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}
