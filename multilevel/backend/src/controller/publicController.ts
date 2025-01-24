import { Request, Response } from "express";
import { responseHandler } from "../utils/helper";
import { PublicKey } from "@solana/web3.js";
import queueManager from "../utils/distributeQueue";
import { getUserStore } from "../services/redisStore";

//called when user joins a new plan or upgrades
export const join = async (req: Request, res: Response) => {
  try {
    let { address } = req.body;
    if (!address) {
      throw "Invalid Address";
    }
    let userPubKey = new PublicKey(address);
    if (queueManager.contains(userPubKey)) {
      throw "User already in queue";
    }
    if (!queueManager.verifyAndAdd(userPubKey)) {
      throw "User is invalid or already distributed";
    }
    responseHandler.success(res, "User Queued for distribution", {});
  } catch (error) {
    console.log(error);
    responseHandler.error(res, error);
  }
};

export const getReferrerChartData = async (req: Request, res: Response) => {
  try {
    let { address } = req.body;
    let user = new PublicKey(address);
    let userStore = await getUserStore(user);
    for (let i = 0; i < userStore.rewards.length; i++) {}
  } catch (error) {}
};
