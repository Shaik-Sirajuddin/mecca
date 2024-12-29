import { Request, Response } from "express";
import { responseHandler } from "../utils/helper";
import AirdropConfig from "../models/AirdropConfig";

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
