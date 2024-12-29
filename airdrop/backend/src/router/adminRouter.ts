import { Router } from "express";
import * as adminController from "../controller/adminController";

const adminRouter = Router();

adminRouter.post("/update-config", adminController.updateConfig);

export default adminRouter