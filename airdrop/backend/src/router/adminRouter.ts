import { Router } from "express";
import * as adminController from "../controller/adminController";
import {
  adminMiddleware,
  passwordResetLimiter,
} from "../middleware/adminMiddleware";

const adminRouter = Router();

adminRouter.post(
  "/update-config",
  adminMiddleware,
  adminController.updateConfig
);

adminRouter.post("/claims", adminMiddleware, adminController.claimsByDate);
adminRouter.get(
  "/verify-login",
  adminMiddleware,
  adminController.validateLogin
);
adminRouter.get(
  "/total-claims",
  adminMiddleware,
  adminController.getTotalClaims
);

adminRouter.post("/login", adminController.login);
adminRouter.post("/2fa", adminController.twoFactorAuth);
adminRouter.get("/logout", adminController.logout);

adminRouter.post(
  "/reset-password",
  passwordResetLimiter,
  adminController.requestPasswordReset
);
adminRouter.post("/confirm-reset-password", adminController.resetPassword);

export default adminRouter;
