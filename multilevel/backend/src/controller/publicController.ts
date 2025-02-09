import { Request, Response } from "express";
import { responseHandler } from "../utils/helper";
import { PublicKey } from "@solana/web3.js";
import queueManager from "../utils/distributeQueue";
import { Reward } from "../schema/reward";
import { getUserData, getUserStore } from "../database/user";
import { formatBalance, generateReferralCode } from "../utils/utils";
import MUserData from "../models/user_data";
import Decimal from "decimal.js";
import { Plan } from "../schema/plan";
import { UserData } from "../schema/user_data";
import { connection, fetchAppState } from "../utils/web3";
import { AppState } from "../schema/app_state";

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
    console.log("user Queued", queueManager.top());
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

const getRewardPercent = (userData: UserData, appState: AppState) => {
  userData.referral_reward
    .add(userData.accumulated.referral_reward)
    .add(
      userData.totalDailyReward(appState).sub(userData.accumulated.daily_reward)
    )
    .div(appState.getPlan(userData.plan_id)!.investment_required)
    .mul(100)
    .toFixed(2);
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    let { page, limit } = req.query;

    // Convert query parameters to integers and set defaults
    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const offset = (pageNumber - 1) * limitNumber;

    const { rows: users, count } = await MUserData.findAndCountAll({
      where: {},
      limit: limitNumber,
      offset: offset,
      order: [["createdAt", "DESC"]],
    });
    let appstate = await fetchAppState(connection);
    let parsedUsers = [];
    for (let i = 0; i < users.length; i++) {
      let user = users[i];
      let userData = new UserData(JSON.parse(user.dataValues.data).data);
      let reward_percent = getRewardPercent(userData, appstate);
      parsedUsers.push({
        address: userData.address.toString(),
        id: userData.id,
        plan_id: userData.plan_id,
        enrolled_at: userData.enrolled_at.toString(),
        referrer: userData.referrer.toString(),
        reward_percent,
      });
    }
    responseHandler.success(res, "Fetched", {
      total: count,
      totalPages: Math.ceil(count / limitNumber),
      currentPage: pageNumber,
      users: parsedUsers,
    });
  } catch (error) {
    console.log(error);
    responseHandler.error(res, error);
  }
};

export const getAddressFromCode = async (req: Request, res: Response) => {
  try {
    let { code } = req.body;
    if (!code) {
      throw "Invalid code";
    }
    let user = await MUserData.findOne({
      attributes: ["code", "id"],
      where: {
        code: code,
      },
    });
    responseHandler.success(res, "Fetched", {
      address: user ? user?.dataValues.address : "",
    });
  } catch (error) {
    console.log(error);
    responseHandler.error(res, error);
  }
};

export const getUniqueCodeForUser = async (req: Request, res: Response) => {
  try {
    let code = "";
    while (true) {
      code = generateReferralCode();
      let user = await MUserData.findOne({
        attributes: ["code", "id"],
        where: {
          code: code,
        },
      });
      if (!user) {
        break;
      }
    }
    responseHandler.success(res, "Fetched", {
      code: code,
    });
    //TODO : implement code catching to be valid for a maximum of 1 minute
  } catch (error) {
    console.log(error);
    responseHandler.error(res, error);
  }
};
