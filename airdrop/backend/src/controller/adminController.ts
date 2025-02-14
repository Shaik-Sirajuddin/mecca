import { Request, Response } from "express";
import { responseHandler } from "../utils/helper";
import AirdropConfig from "../models/AirdropConfig";
import { getDayStartAndEnd, getStartOfDayUTC } from "../utils/utils";
import AirdropRequest from "../models/AirdropRequest";
import { Op } from "sequelize";
import * as jwt from "jsonwebtoken";
import * as speakeasy from "speakeasy";
import Admin from "../models/Admin";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { sendPasswordResetMail } from "../services/email_service";

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
const validateCredentials = async (email: string, password: string) => {
  const admin = await Admin.findOne({ where: { email } });
  if (!admin) {
    throw "Invalid email";
  }
  // Compare passwords
  return await bcrypt.compare(password, admin.dataValues.password);
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
    const { email, password } = req.body;

    let isValid = await validateCredentials(email, password);
    if (isValid) {
      responseHandler.success(res, "Password is valid", {
        authenticated: true,
      });
    } else {
      responseHandler.error(res, "Invalid password");
    }
  } catch (error) {
    responseHandler.error(res, error);
  }
};

export const twoFactorAuth = async (req: Request, res: Response) => {
  try {
    const { otp, email, password } = req.body;

    let isValid = await validateCredentials(email, password);

    if (!isValid) {
      responseHandler.error(res, "Invalid credentials");
    }

    const verified = speakeasy.totp.verify({
      secret: process.env.TOTP_SECRET!,
      encoding: "base32",
      token: otp,
    });
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

// Request Password Reset
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      responseHandler.error(res, "Invalid Email");
      return;
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set token and expiration in the database
    const tokenExpiration = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration
    await admin.update({
      resetToken: hashedToken,
      resetTokenExpiry: tokenExpiration,
    });

    // Send reset email
    await sendPasswordResetMail(email, resetToken);
    responseHandler.success(res, "Password reset email sent");
  } catch (error) {
    responseHandler.error(res, error);
  }
};

// Reset Password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    // Find admin by email
    const admin = await Admin.findOne({ where: { resetToken: hashedToken } });
    if (!admin) {
      responseHandler.error(res, "Invalid Reset token");
      return;
    }

    if (newPassword.toString().length < 8) {
      throw "Password should contain atleast 8 characeters";
    }

    // Verify token and expiration
    if (
      !admin.dataValues.resetTokenExpiry ||
      admin.dataValues.resetTokenExpiry < new Date()
    ) {
      responseHandler.error(res, "Invalid or expired token");
      return;
    }

    // Hash and update the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await admin.update({
      password: hashedPassword,
      resetToken: null, // Clear the reset token
      resetTokenExpiry: null,
    });

    responseHandler.success(res, "Password reset successfully");
  } catch (error) {
    responseHandler.error(res, error);
  }
};
