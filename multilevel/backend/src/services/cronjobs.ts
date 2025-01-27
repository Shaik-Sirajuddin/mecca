import cron from "node-cron";
import { distributeReferralRewards } from "./distributeReferralRewards";
export const setUpCron = async () => {
  distributeReferralRewards();
  cron.schedule("*/20 * * * * *", async () => {
    console.log("Running a task every 20 seconds:", new Date());
    distributeReferralRewards();
  });
};
