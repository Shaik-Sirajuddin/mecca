import { Router } from "express";
import * as adminController from "../controller/adminController";
const adminRouter = Router();

adminRouter.post("/update-round", adminController.updateRoundDetails);
adminRouter.post("/update-config", adminController.updateConfig);
adminRouter.get("/contract-state", adminController.fetchContractState);
export default adminRouter;
