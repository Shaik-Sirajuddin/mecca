import { Request, Response } from "express";
import { responseHandler } from "../utils/helper";
import AirdropConfig from "../models/AirdropConfig";
import { getDayStartAndEnd, getStartOfDayUTC } from "../utils/utils";
import AirdropRequest from "../models/AirdropRequest";
import { Op } from "sequelize";

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
export const login = async (req: Request, res: Response) => {
  try {
    responseHandler.success(res, "Login success");
  } catch (error) {
    responseHandler.error(res, error);
  }
};
