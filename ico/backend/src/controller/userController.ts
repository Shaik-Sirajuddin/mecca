import { Request, Response } from "express";
import { responseHandler } from "../utils/helper";
import { PublicKey } from "@solana/web3.js";
import { deciNZ } from "../utils/utils";
import IcoConfig from "../models/IcoConfig";
import Round, {
  RoundAttributes,
  RoundCreationAttributes,
} from "../models/Round";
import {
  generatePurchaseTransactionSigned,
  getTokensAvailableForSale,
} from "../web3";
import Model from "sequelize/types/model";
import Decimal from "decimal.js";
import { token, usdt } from "../constants";
import { amountToUiAmount } from "@solana/spl-token";

const getCurrentRound = async (curTime: Date) => {
  let rounds = await Round.findAll({
    where: {},
    order: [["endTime", "ASC"]],
  });

  let validRound = null;

  for (let i = 0; i < rounds.length; i++) {
    if (curTime.getTime() < rounds[i].dataValues.endTime.getTime()) {
      return rounds[i];
    }
  }
  return null;
};
const fetchSolPrice = async () => {
  let url = `https://api.binance.com/api/v3/ticker/24hr?symbol=SOLUSDT`;
  let response = await fetch(url);
  let data = await response.json();
  return new Decimal(data.lastPrice);
};
/**
 *
 * @param round
 * @param amount
 * @param is_usdt
 * @returns tokens without decimal representation
 */
const calculateSendAmount = async (
  round: Model<RoundAttributes, RoundCreationAttributes>,
  amount: Decimal,
  is_usdt: boolean
) => {
  if (!is_usdt) {
    //sol * (usd per sol)
    amount = (await fetchSolPrice()).mul(amount);
  }
  let tokenPrice = round.dataValues.tokenPrice;
  return new Decimal(
    amount.div(tokenPrice).mul(Math.pow(10, token.decimals)).toFixed(0)
  );
};

export const purchase = async (req: Request, res: Response) => {
  try {
    let {
      amount: _amount,
      is_usdt,
      pubkey: _pubkey,
      usdt_ata: _usdtAta,
      token_ata: _tokenAta,
    } = req.body;

    let amount = deciNZ(_amount);
    let pubkey = new PublicKey(_pubkey);

    let usdtAta = null;
    if (usdtAta) {
      usdtAta = new PublicKey(_usdtAta);
    }

    let tokenAta = new PublicKey(_tokenAta);

    if (amount == null || amount.lte(0)) {
      throw "Invalid Amount";
    }

    let curTime = new Date();
    let ico_config = (await IcoConfig.findOne({}))!;

    if (ico_config.dataValues.paused) {
      throw "Ico in paused";
    }

    if (curTime.getTime() < ico_config.dataValues.startTime.getTime()) {
      throw "Ico not started yet";
    }

    let round = await getCurrentRound(curTime);

    if (round == null) {
      throw "No active round";
    }
    let availableForPurchcase = await getTokensAvailableForSale();

    let tokensToSend = await calculateSendAmount(round, amount, is_usdt);

    if (tokensToSend.gt(availableForPurchcase)) {
      throw "Amount exceeds available for purchase";
    }

    let amountFromUser = amount
      .mul(Math.pow(10, is_usdt ? usdt.decimals : token.decimals))
      .toFixed(0);

    let signedTransaction = await generatePurchaseTransactionSigned(
      amountFromUser,
      is_usdt,
      tokensToSend.toString(),
      pubkey,
      usdtAta,
      tokenAta
    );

    responseHandler.success(res, "success", {
      data: signedTransaction,
    });
  } catch (error) {
    responseHandler.error(res, error);
  }
};
