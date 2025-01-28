import cron from "node-cron";
import { distributeReferralRewards } from "./distributeReferralRewards";
import MUserData from "../models/user_data";
import { getUserData, storeUserData } from "../database/user";
import { PublicKey } from "@solana/web3.js";
import { sleep } from "../utils/utils";
import { fetchUserDataFromNode } from "../utils/web3";
const syncUserData = async () => {
  let users = await MUserData.findAll({
    where: {},
  });

  for (let i = 0; i < users.length; i++) {
    let userData = await fetchUserDataFromNode(
      new PublicKey(users[i].dataValues.address)
    );
    await storeUserData(new PublicKey(users[i].dataValues.address), userData);
    await sleep(500);
  }
};
export const setUpCron = async () => {
  distributeReferralRewards();
  cron.schedule("*/20 * * * * *", async () => {
    console.log("Running a task every 20 seconds:", new Date());
    distributeReferralRewards();
  });
  cron.schedule("0 * * * *", () => {
    console.log("Running a task every hour at the start of the hour");
    // Add your task logic here
    syncUserData();
  });

};
