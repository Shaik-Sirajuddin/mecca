import { NextFunction, Request, Response } from "express";
import { responseHandler } from "../utils/helper";
import * as jwt from "jsonwebtoken";

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = jwt.verify(token, process.env.JWT_SECRET!);
    if (user !== "ADMIN") {
      throw "Unauthorized User";
    }
    next();
  } catch (err: any) {
    responseHandler.error(res, err);
  }
};
