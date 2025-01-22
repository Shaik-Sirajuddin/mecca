import cron from "node-cron";
import { distributeReferralRewards } from "./distributeReferralRewards";
export const setUpCron = async () => {
  cron.schedule("*/1 * * * *", async () => {
    console.log("Running a task every 1 minutes:", new Date());
    distributeReferralRewards();
  });
};
