import { Request, Response } from "express";
import { responseHandler } from "../utils/helper";
import { getCacheData } from "../config/redis";
import { CACHE_KEY } from "../enums/CacheKeys";
import DailyStats from "../models/DailyStats";
import { getStartOfDayUTC } from "../utils/utils";

export const fetchStats = async (req: Request, res: Response) => {
  try {
    let interest = {
      day: await getCacheData(CACHE_KEY.INTEREST_24HR),
      standy: await getCacheData(CACHE_KEY.INTEREST_STANDY),
    };
    responseHandler.success(res, "Fetched", { interest });
  } catch (error) {
    responseHandler.error(res, error);
  }
};

export const fetchChartData = async (req: Request, res: Response) => {
  try {
    let dailyStats = await DailyStats.findAll({
      where: {},
      order: [["id", "ASC"]],
    });
    let parsedStats: any[] = [];

    let reqAdditional = 7 - dailyStats.length;
    let startDate =
      dailyStats.length > 0
        ? dailyStats[0].dataValues.date
        : getStartOfDayUTC();
    while (reqAdditional > 0) {
      parsedStats.push({
        date: startDate,
        stakedAmount: "0",
      });
      reqAdditional--;
      startDate = new Date(startDate.getTime() - 86400 * 1000);
    }
    parsedStats = parsedStats.reverse();
    dailyStats.forEach((item) => {
      parsedStats.push({
        date: item.dataValues.date,
        stakedAmount: item.dataValues.stakedAmount,
      });
    });

    responseHandler.success(res, "Fetched", { stats: parsedStats });
  } catch (error) {
    responseHandler.error(res, error);
  }
};
