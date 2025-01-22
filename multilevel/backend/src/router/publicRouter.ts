import { Router } from "express";
import * as publicController from "../controller/publicController";
const publicRouter = Router();

publicRouter.post("/distribute", publicController.distribute);
export default publicRouter;
