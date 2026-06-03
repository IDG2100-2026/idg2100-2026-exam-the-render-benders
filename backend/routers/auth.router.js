import express from "express";
import authController from "../controllers/auth.controller.js";
import { validateCreateUser, handleValidationErrors } from "../validators/user.validator.js";

const authRouter = express.Router();

authRouter.post("/register", validateCreateUser, handleValidationErrors, authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/refresh", authController.refresh);
authRouter.post("/logout", authController.logout);
authRouter.post("/verify-email", authController.verifyEmail);
authRouter.post("/resend-verification", authController.resendVerification);

export default authRouter;