import { body, validationResult } from "express-validator";

export const validateCreateTrophy = [
    body("title")
        .isString()
        .notEmpty()
        .withMessage("Title is required"),
    body("tournament")
        .isMongoId()
        .withMessage("tournament must be a valid tournament ID")
];

export function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}
