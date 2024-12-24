import { Router } from "express";
import * as publicController from "../controller/publicController";
const publicRouter = Router();

publicRouter.post("/purchase", publicController.purchase);
publicRouter.get("/state", publicController.fetchICOState);
export default publicRouter;
