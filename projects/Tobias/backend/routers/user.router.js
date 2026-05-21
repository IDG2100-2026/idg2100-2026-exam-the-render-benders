import express from "express";
import userController from "../controllers/user.controller.js";
import userValidator from "../validators/user.validator.js";
import { validate } from "../middleware/validate.js";
import { requireAdmin, requireUser } from "../middleware/auth.js";
// need to import this for "the last 10 games"
import matchController from "../controllers/match.controller.js";
// need to import this for the profile picture upload
import { upload } from "../middleware/upload.js";

const userRouter = express.Router();

// get all users
userRouter.get("/", requireAdmin, userController.getAllUsers);

// login
userRouter.post("/login", 
    userValidator.validateLogin(),
    validate,
    userController.loginUser
);

// get a single user
userRouter.get("/:uid",
    // using checkUserExistence directly inside validateUid 
    // needs to validate before the controller
    userValidator.validateUid(),
    validate,
    userController.getUser
);

// create a guest user (no validation needed)
userRouter.post("/guest", userController.createGuestUser);

// create a user
userRouter.post("/",
    // must validate that the data fills the criteria
    // needs to validate before the controller
    userValidator.validateUser(),
    validate,
    userController.createUser
);

// update a user
userRouter.patch("/:uid",
    // using checkUserExistence directly inside validateUid 
    // needs to validate before the controller
    userValidator.validateUid(), 
    requireUser,
    userValidator.validateUserUpdate(),
    validate,
    userController.updateUser
);

// ban a user
userRouter.patch("/:uid/ban", 
    // using checkUserExistence directly inside validateUid 
    // needs to validate before the controller
    userValidator.validateUid(),
    requireAdmin,
    validate,
    userController.banUser
);

// getting the 10 most recent matches for a specific user
userRouter.get("/:uid/matches", 
    userValidator.validateUid(),
    validate,
    matchController.getUsersRecentMatches
);

userRouter.get("/:uid/stats", 
    userValidator.validateUid(),
    validate,
    matchController.getMatchStats
);

// added in Oblig3 
userRouter.patch("/:uid/image", 
    userValidator.validateUid(),
    requireUser,
    validate,
    upload.single("image"),
    userController.updateProfilePicture
);

export default userRouter;