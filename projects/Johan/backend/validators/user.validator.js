import { body, validationResult } from "express-validator";

export const validateCreateUser = [
    body("username")
        .isLength({ min: 4, max: 64 })
        .withMessage("Username must be between 4 and 64 characters")
        .matches(/^\w+$/)
        .withMessage("Username can only contain letters, numbers and underscores"),
    body("email")
        .isEmail()
        .withMessage("Must be a valid email"),
    body("pwd")
        .isLength({ min: 8, max: 128 })
        .withMessage("Password must be between 8 and 128 characters"),
    body("dateOfBirth")
        .isISO8601()
        .withMessage("Must be a valid date")
];

export const validateUpdateUser = [
    body("email")
        .optional()
        .isEmail()
        .withMessage("Must be a valid email"),
    body("pwd")
        .optional()
        .isLength({ min: 8, max: 128 })
        .withMessage("Password must be between 8 and 128 characters"),
    body("dateOfBirth")
        .optional()
        .isISO8601()
        .withMessage("Must be a valid date"),
    body("aboutMe")
        .optional()
        .isString()
        .isLength({ max: 500 })
        .withMessage("About me cannot exceed 500 characters")
];

// Checks if any validation errors were found and returns 400 if so, otherwise passes to the next handler
export function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}