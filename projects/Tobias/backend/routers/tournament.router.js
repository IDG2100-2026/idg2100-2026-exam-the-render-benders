import express from "express";
import tournamentController from "../controllers/tournament.controller.js";
import tournamentValidator from "../validators/tournament.validator.js";
import { validate } from "../middleware/validate.js";
import { requireAdmin, requireUser } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const tournamentRouter = express.Router();

// get all tournaments
tournamentRouter.get("/", tournamentController.getAllTournaments);

// get a tournament
tournamentRouter.get("/:tid", 
    tournamentValidator.validateTid(),
    validate,
    tournamentController.getTournament
);

// create a tournament
tournamentRouter.post("/", 
    requireAdmin,
    upload.single("trophy"), 
    tournamentValidator.validateTournament(),
    validate,
    tournamentController.createTournament
);

// start a tournament
tournamentRouter.patch("/:tid/start", 
    tournamentValidator.validateTid(),
    requireAdmin,
    validate,
    tournamentController.startTournament
);

// join a tournament
tournamentRouter.patch("/:tid/join", 
    tournamentValidator.validateTid(),
    tournamentValidator.validateJoin(),
    requireUser,
    validate,
    tournamentController.joinTournament
);

// edit a tournament
tournamentRouter.patch("/:tid", 
    tournamentValidator.validateTid(),
    requireAdmin,
    upload.single("trophy"),
    validate,
    tournamentController.editTournament
);

// finish a tournament
tournamentRouter.patch("/:tid/finish", 
    tournamentValidator.validateTid(),
    requireAdmin,
    validate,
    tournamentController.finishTournament
);

// delete a tournament
tournamentRouter.delete("/:tid", 
    tournamentValidator.validateTid(),
    requireAdmin,
    validate,
    tournamentController.deleteTournament
);

export default tournamentRouter;
