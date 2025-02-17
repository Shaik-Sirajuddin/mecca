import { Request, Response } from "express";
import { responseHandler } from "../utils/helper";
import Decimal from "decimal.js";
import Round from "../models/Round";
import IcoConfig from "../models/IcoConfig";
import { getContractState } from "../web3";

export const updateRoundDetails = async (req: Request, res: Response) => {
  try {
    let { id, tokenPrice: _tokenPrice, endTime: _endTime } = req.body;

    //throws error if invalid amount
    let tokenPrice = new Decimal(_tokenPrice);
    let endTime = new Date(_endTime);

    let rounds = await Round.findAll({ where: {}, order: [["id", "ASC"]] });

    for (let i = 0; i < rounds.length; i++) {
      if (rounds[i].dataValues.id !== id) continue;
      if (i != 0 && rounds[i - 1].dataValues.endTime >= endTime) {
        throw "All endtimes should be in ascending order";
      }
      if (
        i != rounds.length - 1 &&
        rounds[i + 1].dataValues.endTime <= endTime
      ) {
        throw "All endtimes should be in ascending order";
      }
    }

    await Round.update(
      {
        tokenPrice: tokenPrice.toString(),
        endTime: endTime,
      },
      {
        where: {
          id: id,
        },
      }
    );

    responseHandler.success(res, "Updated");
  } catch (error) {
    responseHandler.error(res, error);
  }
};

export const updateConfig = async (req: Request, res: Response) => {
  try {
    let { paused, startTime: _startTime } = req.body;

    console.log(_startTime , "this ")
    await IcoConfig.update(
      {
        paused: paused,
        startTime: new Date(_startTime),
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

export const fetchContractState = async (req: Request, res: Response) => {
  try {
    let state = await getContractState();
    responseHandler.success(res, "Fetched", state);
  } catch (error) {
    responseHandler.error(res, error);
  }
};
