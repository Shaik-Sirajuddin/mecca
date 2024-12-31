import { Router } from "express";
import * as adminController from "../controller/adminController";

const adminRouter = Router();

adminRouter.post("/update-config", adminController.updateConfig);
adminRouter.get("/login", adminController.login);
adminRouter.post("/claims", adminController.claimsByDate);
adminRouter.get("/total-claims", adminController.getTotalClaims);

export default adminRouter;
