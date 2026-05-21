import { validationResult } from "express-validator";

// middleware that checks if there are any validation errors 
// if there are errors, return them to client instead of continuing
export function validate(req, res, next){
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        // return 400 (bad request) with the list of validation errors
        return res.status(400).json({ errors: errors.array() });
    }
    // no errors, continue to controller
    next();
}

