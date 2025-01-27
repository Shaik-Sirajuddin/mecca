import { Router } from "express";
import * as publicController from "../controller/publicController";
const publicRouter = Router();

publicRouter.post("/join", publicController.join);
publicRouter.post("/referrer-chart", publicController.getReferrerChartData);
export default publicRouter;
