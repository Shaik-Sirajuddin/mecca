import { Request, Response } from "express";
import { responseHandler } from "../utils/helper";
import { PublicKey } from "@solana/web3.js";
import queueManager from "../utils/distributeQueue";
import { storeUser } from "../services/redisStore";

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
    await storeUser(userPubKey);
    responseHandler.success(res, "User Queued for distribution", {});
  } catch (error) {
    console.log(error);
    responseHandler.error(res, error);
  }
};
