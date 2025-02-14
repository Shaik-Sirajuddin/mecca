import { Router } from "express";
import * as adminController from "../controller/adminController";
import { adminMiddleware } from "../middleware/adminMiddleware";

const adminRouter = Router();

adminRouter.post(
  "/update-config",
  adminMiddleware,
  adminController.updateConfig
);
adminRouter.post("/login", adminController.login);
adminRouter.get("/logout", adminController.logout);
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

export default adminRouter;
