import { Request, Response } from "express";
import { responseHandler } from "../utils/helper";
import { PublicKey } from "@solana/web3.js";
import queueManager from "../utils/distributeQueue";
import { Reward } from "../schema/reward";
import { getUserData, getUserStore } from "../database/user";
import { formatBalance } from "../utils/utils";

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

interface ChartUser {
  address: string;
  id: string;
  referrer: string;
  amount: string;
  current_plan: number;
}
const appendUserPath = async (
  user: PublicKey,
  amount: string,
  userSet: Set<string>,
  userList: ChartUser[]
) => {
  if (userSet.has(user.toString())) {
    return {};
  }
  userSet.add(user.toString());
  let userData = await getUserData(user);
  let userItem = {
    address: user.toString(),
    referrer: userData.referrer.toString(),
    amount: amount,
    current_plan: userData.plan_id,
    id: userData.id,
  };
  userList.push(userItem);
  userSet.add(user.toString());

  await appendUserPath(userData.referrer, "0", userSet, userList);
};

export const getReferrerChartData = async (req: Request, res: Response) => {
  try {
    let { address } = req.body;

    let user = new PublicKey(address);
    let userData = await getUserData(user);
    let userStore = await getUserStore(user);
    let rewards = userStore.rewards.sort((a, b) =>
      a.plan_entry_time.sub(b.plan_entry_time).toNumber()
    );
    let groupedRewards: Reward[] = [];
    let accountedUsers = new Set<string>();
    for (let i = 0; i < rewards.length; i++) {
      if (accountedUsers.has(rewards[i].user.toString())) continue;
      let accumulatedReward = Reward.fromJSON(rewards[i].toJSON());
      for (let j = i + 1; j < rewards.length; j++) {
        if (rewards[i].user.equals(rewards[j].user)) {
          accumulatedReward.invested_amount.add(rewards[j].reward_amount);
        }
      }
      accountedUsers.add(rewards[i].user.toString());
      groupedRewards.push(accumulatedReward);
    }
    let sortedRewards = groupedRewards.sort((a, b) => a.level - b.level);

    let userList: ChartUser[] = [
      {
        address: user.toString(),
        referrer: userData.referrer.toString(),
        amount: "0",
        current_plan: userData.plan_id,
        id: userData.id,
      },
    ];
    let userSet = new Set<string>();
    userSet.add(user.toString());

    for (let i = 0; i < sortedRewards.length; i++) {
      let reward = sortedRewards[i];
      await appendUserPath(
        reward.user,
        formatBalance(reward.reward_amount),
        userSet,
        userList
      );
    }
    responseHandler.success(res, "Fetched", userList);
  } catch (error) {
    console.log(error);
    responseHandler.error(res, error);
  }
};
