import { Request, Response } from "express";
import { responseHandler } from "../utils/helper";
import AirdropConfig from "../models/AirdropConfig";
import { getDayStartAndEnd, getStartOfDayUTC } from "../utils/utils";
import AirdropRequest from "../models/AirdropRequest";
import { Op } from "sequelize";
import * as jwt from "jsonwebtoken";
import * as speakeasy from "speakeasy";
export const updateConfig = async (req: Request, res: Response) => {
  try {
    let { endTime, minSolAmount, paused } = req.body;

    endTime = new Date(endTime);

    await AirdropConfig.update(
      {
        endTime,
        minSolAmount,
        paused,
      },
      {
        where: {},
      }
    );
    responseHandler.success(res, "Updated");
  } catch (error) {
    responseHandler.error(res, error);
  }
};

export const getTotalClaims = async (req: Request, res: Response) => {
  try {
    let startOfDay = getStartOfDayUTC();

    let claimCount = await AirdropRequest.count({
      where: {
        createdAt: {
          [Op.gte]: startOfDay,
        },
        [Op.or]: [
          {
            success: true,
          },
          {
            underProcess: true,
          },
        ],
      },
    });

    responseHandler.success(res, "Fetched", {
      count: claimCount,
    });
  } catch (error) {
    responseHandler.error(res, error);
  }
};

export const claimsByDate = async (req: Request, res: Response) => {
  try {
    let { date } = req.body;

    let { startOfDay, endOfDay } = getDayStartAndEnd(new Date(date));

    let claims = await AirdropRequest.findAll({
      where: {
        createdAt: {
          [Op.between]: [startOfDay, endOfDay],
        },
        success: true,
      },
    });

    let parsedClaims = [];

    claims.forEach((item) => {
      let parsedItem = item.toJSON();
      delete parsedItem.updatedAt;
      parsedClaims.push(parsedItem);
    });

    responseHandler.success(res, "Fetched", claims);
  } catch (error) {
    responseHandler.error(res, error);
  }
};

// Function to generate a JWT token with 15 min validity
const generateToken = (user: string) => {
  return jwt.sign({user}, process.env.JWT_SECRET!, { expiresIn: "15m" });
};
export const validateLogin = async (req: Request, res: Response) => {
  try {
    responseHandler.success(res, "Logged in");
  } catch (error) {
    responseHandler.error(res, error);
  }
};
export const login = async (req: Request, res: Response) => {
  try {
    const { otp } = req.body;
    const verified = speakeasy.totp.verify({
      secret: process.env.TOTP_SECRET!,
      encoding: "base32",
      token: otp,
    });
    console.log(process.env.TOTP_SECRET , otp)
    if (!verified) {
      throw "Invalid OTP";
    }
    const token = generateToken("ADMIN");
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite : 'none' });
    responseHandler.success(res, "Login success");
  } catch (error) {
    console.log(error)
    responseHandler.error(res, error);
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token");
    responseHandler.success(res, "Logged out!");
  } catch (error) {
    responseHandler.error(res, error);
  }
};
