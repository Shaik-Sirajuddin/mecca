import cron from "node-cron";
import {
  findTotalAccInterest24Hrs,
  getAppState,
  getInterestStandBy,
} from "../web3";
import { rpcConnection } from "../config/rpcConnection";
import { setCacheData } from "../config/redis";
import { CACHE_KEY } from "../enums/CacheKeys";
import { AppState } from "../schema/app_state_schema";
import DailyStats from "../models/DailyStats";
import { splToken } from "../constants";
import { getStartOfDayUTC } from "../utils/utils";
// Schedule a job to run every 10 minutes

const createDBEntry = async (appState: AppState) => {
  const todayUTC = getStartOfDayUTC();

  let entry = await DailyStats.findOne({
    where: {
      date: todayUTC,
    },
  });
  if (!entry) {
    await DailyStats.create({
      date: todayUTC,
      stakedAmount: appState.staked_amount
        .div(Math.pow(10, splToken.decimals))
        .toString(),
    });
  } else {
    await entry.update({
      stakedAmount: appState.staked_amount
        .div(Math.pow(10, splToken.decimals))
        .toString(),
    });
  }
};
const updateStats = async () => {
  let appState = await getAppState(rpcConnection);
  createDBEntry(appState);
  setCacheData(
    CACHE_KEY.INTEREST_24HR,
    (await findTotalAccInterest24Hrs(rpcConnection, appState)).toString()
  );
  setCacheData(
    CACHE_KEY.INTEREST_STANDY,
    (await getInterestStandBy(rpcConnection, appState)).toString()
  );
};

export const setUpCron = async () => {
  cron.schedule("*/10 * * * *", async () => {
    console.log("Running a task every 10 minutes:", new Date());
    updateStats();
  });
  await updateStats();
};