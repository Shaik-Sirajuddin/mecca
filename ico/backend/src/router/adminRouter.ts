import { Router } from "express";
import * as adminController from "../controller/adminController";
const adminRouter = Router();

adminRouter.post("/update-status", adminController.updateSaleStatus);
adminRouter.post("/update-start-time", adminController.updateSaleStartTime);

export default adminRouter;
