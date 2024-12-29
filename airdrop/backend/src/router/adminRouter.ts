import { Router } from "express";
import * as adminController from "../controller/adminController";

const adminRouter = Router();

adminRouter.post("/update-config", adminController.updateConfig);
adminRouter.get("/login", adminController.login);

export default adminRouter