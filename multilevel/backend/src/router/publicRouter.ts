import { Router } from "express";
import * as publicController from "../controller/publicController";
const publicRouter = Router();

publicRouter.post("/join", publicController.join);
publicRouter.post("/referrer-chart", publicController.getReferrerChartData);

publicRouter.get("/user-stats", publicController.getUserStats);
publicRouter.get("/users", publicController.getUsers);
publicRouter.get("/search-user", publicController.searchUser);

publicRouter.get("/code", publicController.getUniqueCodeForUser);
publicRouter.post("/address-from-code", publicController.getAddressFromCode);
publicRouter.post("/crew", publicController.getCrewList);
export default publicRouter;
