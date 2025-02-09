import { Router } from "express";
import * as publicController from "../controller/publicController";
const publicRouter = Router();

publicRouter.post("/join", publicController.join);
publicRouter.post("/referrer-chart", publicController.getReferrerChartData);
publicRouter.get("/user-stats", publicController.getUserStats);
publicRouter.get("/users", publicController.getUsers);
publicRouter.get("/code", publicController.getUniqueCodeForUser);
publicRouter.get("/address-from-code", publicController.getAddressFromCode);
export default publicRouter;
