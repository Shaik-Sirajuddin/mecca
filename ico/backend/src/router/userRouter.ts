import { Router } from "express";
import * as userController from "../controller/userController";
const userRouter = Router();

userRouter.post("/purchase", userController.purchase);

export default userRouter;
