import { body } from "express-validator";
export { handleValidationErrors } from "../utils/handleValidationErrors.js";

export const validateCreateTrophy = [
    body("title")
        .isString()
        .notEmpty()
        .withMessage("Title is required"),
    body("tournament")
        .isMongoId()
        .withMessage("tournament must be a valid tournament ID")
];
