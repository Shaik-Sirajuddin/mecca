import { Router } from "express";
import * as publicController from "../controller/publicController";
const publicRouter = Router();

publicRouter.post("/claim", publicController.claimAirdrop);
publicRouter.get("/config", publicController.getAirdropConfig);
export default publicRouter;
