import express from "express";
import matchController from "../controllers/match.controller.js";
import matchValidator from "../validators/match.validator.js";
import { validate } from "../middleware/validate.js";

const matchRouter = express.Router();

// get all matches
matchRouter.get("/", matchController.getAllMatches);

// get a single match
matchRouter.get("/:mid",
    matchValidator.validateMid(),
    validate,
    matchController.getMatch
);

// create a match
matchRouter.post("/", 
    matchValidator.validateMatch(),
    validate,
    matchController.createMatch
);

// join a match 
matchRouter.patch("/:mid/join", 
    matchValidator.validateMid(),
    matchValidator.validateJoin(),
    validate,
    matchController.joinMatch
);

// save a match
matchRouter.patch("/:mid/save", 
    matchValidator.validateMid(),
    validate,
    matchController.saveMatch
);

export default matchRouter;
