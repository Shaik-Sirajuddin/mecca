import { Request, Response } from "express";
import { responseHandler } from "../utils/helper";
import { PublicKey } from "@solana/web3.js";
import queueManager from "../utils/distributeQueue";
import { Reward } from "../schema/reward";
import { getUserData, getUserStore } from "../database/user";
import { formatBalance } from "../utils/utils";
import MUserData from "../models/user_data";
import Decimal from "decimal.js";
import { Plan } from "../schema/plan";
import { UserData } from "../schema/user_data";
import { connection, fetchAppState } from "../utils/web3";

//called when user joins a new plan or upgrades
export const join = async (req: Request, res: Response) => {
  try {
    //TODO : rate limit endpoint for an address 
    let { address } = req.body;
    if (!address) {
      throw "Invalid Address";
    }
    let userPubKey = new PublicKey(address);
    if (queueManager.contains(userPubKey)) {
      throw "User already in queue";
    }
    if (!(await queueManager.verifyAndAdd(userPubKey))) {
      throw "User is invalid or already distributed";
    }
    console.log("user Queued" , queueManager.top())
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

export const getUserStats = async (req: Request, res: Response) => {
  try {
    let users = await MUserData.findAll({
      where: {},
    });
    let data = {
      participants: [0, 0, 0],
      userClaimable: "",
      accDailyReward: "",
      accReferralReward: "",
      accFee: "",
    };
    let userClaimable = new Decimal(0);
    let accDailyReward = new Decimal(0);
    let accReferralReward = new Decimal(0);
    let accFee = new Decimal(0);
    //todo : migrate to fetch from cache
    let appstate = await fetchAppState(connection);
    for (let i = 0; i < users.length; i++) {
      let user = users[i];
      let userData = new UserData(JSON.parse(user.dataValues.data).data);
      data.participants[userData.plan_id]++;
      userClaimable = userClaimable.add(
        userData.availableForWithdraw(appstate)
      );
      accDailyReward = accDailyReward.add(userData.totalDailyReward(appstate));
      accReferralReward = accReferralReward.add(
        userData.referral_reward.add(userData.accumulated.referral_reward)
      );
      accFee = accFee.add(userData.totalFeePaid(appstate));
    }
    data.userClaimable = userClaimable.toString();
    data.accDailyReward = accDailyReward.toString();
    data.accReferralReward = accReferralReward.toString();
    data.accFee = accFee.toString();

    responseHandler.success(res, "Fetched", data);
  } catch (error) {
    console.log(error);
    responseHandler.error(res, error);
  }
};
