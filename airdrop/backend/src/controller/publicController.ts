import { Request, Response } from "express";
import { responseHandler } from "../utils/helper";
import { PublicKey } from "@solana/web3.js";
import { deciNZ, getIPFromRequest, getStartOfDayUTC } from "../utils/utils";
import { getBalanceUser, transferTokens } from "../web3";
import { token } from "../constants";
import AidropRequest from "../models/AirdropRequest";
import { Op } from "sequelize";
import AirdropConfig from "../models/AirdropConfig";
import Decimal from "decimal.js";

export const claimAirdrop = async (req: Request, res: Response) => {
  try {
    let { user: _pubkey } = req.body;
    let userIp = getIPFromRequest(req)
    console.log(userIp)
    let pubkey = new PublicKey(_pubkey);

    let config = (await AirdropConfig.findOne({ where: {} }))!;

    if (config.dataValues.paused) {
      throw "Aidrop is currently paused";
    }
    if (config.dataValues.endTime.getTime() <= Date.now()) {
      throw "Airdrop Period has been Completed";
    }

    let startOfDay = getStartOfDayUTC();

    let claimCount = await AidropRequest.count({
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

    if (claimCount >= 5000) {
      throw "The airdrop has been ended today. Maximum claims Reached";
    }

    // let dayAgo = new Date(Date.now() - 86400 * 1000);
    let claim_request = await AidropRequest.findOne({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              {
                ip: userIp,
              },
              {
                address: pubkey.toString(),
              },
            ],
          },
          {
            [Op.or]: [
              {
                success: true,
              },
              {
                underProcess: true,
              },
            ],
          },
        ],
        createdAt: { [Op.gte]: startOfDay },
      },
    });

    //current check includes for a request on the same day (utc time)

    if (claim_request) {
      if (claim_request.dataValues.underProcess) {
        throw "Too frequent requests";
      }
      if (claim_request.dataValues.ip === userIp) {
        throw "Multiple Claims not possible from Same IP";
      }
      throw "Airdrop is possible once a day";
    }
    let balance = await getBalanceUser(pubkey);
    balance = balance.div(Math.pow(10, 9));

    if (balance.lt(config.dataValues.minSolAmount)) {
      throw "Please come back later , There isn't sufficient balance in airdrop wallet";
    }

    let new_claim_request = await AidropRequest.create({
      address: pubkey.toString(),
      ip: userIp,
      success: false,
      underProcess: true,
    });

    let amountToSend = new Decimal(config.dataValues.amount)
      .mul(Math.pow(10, token.decimals))
      .toFixed(0);

    let transferStatus = await transferTokens(pubkey, amountToSend.toString());

    await new_claim_request.update({
      success: transferStatus,
      underProcess: false,
    });

    if (!transferStatus) {
      throw "Failed to request airdrop";
    }

    responseHandler.success(res, "Success", {});
  } catch (error) {
    console.log(error);
    responseHandler.error(res, error);
  }
};

export const getAirdropConfig = async (req: Request, res: Response) => {
  try {
    let config = await AirdropConfig.findOne({ where: {} });
    config = config!;
    let parsedConfig = {
      minSolAmount: config.dataValues.minSolAmount,
      paused: config.dataValues.paused,
      endTime: config.dataValues.endTime,
      amount: config.dataValues.amount,
    };
    responseHandler.success(res, "Fetched", parsedConfig);
  } catch (error) {
    console.log(error);
    responseHandler.error(res, error);
  }
};
