import { Router } from "express";
import * as publicController from "../controller/publicController";
const publicRouter = Router();

publicRouter.get("/stats", publicController.fetchStats);
publicRouter.get("/chart-data", publicController.fetchChartData);
export default publicRouter;
