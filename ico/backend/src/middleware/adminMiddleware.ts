import { NextFunction, Request, Response } from "express";
import { responseHandler } from "../utils/helper";

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let authKey = process.env.AUTH_KEY!;
    let authSecret = req.headers.authorization?.trim();

    if (!authSecret || authSecret != authKey) {
      throw "Unauthorized";
    }

    next();
  } catch (error: any) {
    responseHandler.error(res, error.toString());
    console.log(error);
  }
};
