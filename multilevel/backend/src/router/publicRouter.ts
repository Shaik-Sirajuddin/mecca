import { Router } from "express";
import * as publicController from "../controller/publicController";
const publicRouter = Router();

publicRouter.post("/join", publicController.join);
export default publicRouter;
