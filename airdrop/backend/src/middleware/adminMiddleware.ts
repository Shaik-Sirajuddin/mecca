import { NextFunction, Request, Response } from "express";
import { responseHandler } from "../utils/helper";
import * as jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";

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

// Rate limiter middleware
export const passwordResetLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 1 minute window
  max: 3, // limit each IP to 1 request per windowMs
  message: {
    message:
      "Too many password reset requests from this IP, please try again after some time",
  },
  keyGenerator: (req) => req.body.email ?? "", // Apply rate limit based on email
});
