import { Connection, PublicKey } from "@solana/web3.js";
import { appStateId, stakeProgramId } from "./constants";
import { User, UserSchema } from "./schema/user";
import { AppState, AppStateSchema } from "./schema/app_state_schema";
import Decimal from "decimal.js";

const calculate24HrInterestUser = (
  user: User,
  appState: AppState,
  startTimeS: number,
  curTimeS: number
) => {
  startTimeS = Math.max(startTimeS, user.stake_time.toNumber());
  if (appState.interest_history.length == 0) {
    return new Decimal(0);
  }
  let unaccountedInterest = new Decimal(0);
  let lastAccountedTime = new Decimal(startTimeS);

  let idx = user.change_list_index;

  while (idx < appState.interest_history.length) {
    let curRateChange = appState.interest_history[idx];
    if (curRateChange.time.gt(startTimeS)) {
      idx = Math.max(0, idx - 1);
      break;
    }
    idx++;
  }

  if (idx == appState.interest_history.length) {
    idx--;
  }

  let curSlotInterest = appState.interest_history[idx].rate;
  idx++;

  // Iterate through interest history to calculate interest for each rate change period
  while (idx < appState.interest_history.length) {
    const curRateChange = appState.interest_history[idx];
    const diffTime = curRateChange.time.sub(lastAccountedTime);

    unaccountedInterest = unaccountedInterest.add(
      user.calculateInterest(diffTime, user.principal_in_stake, curSlotInterest)
    );

    lastAccountedTime = curRateChange.time;
    curSlotInterest = curRateChange.rate;
    idx++;
  }

  // Calculate remaining interest for the period up to the current time
  const diffTime = new Decimal(curTimeS).sub(lastAccountedTime);

  unaccountedInterest = unaccountedInterest.add(
    user.calculateInterest(
      diffTime,
      user.principal_in_stake,
      Number(curSlotInterest)
    )
  );

  return unaccountedInterest;
};

export const getAppState = async (connection: Connection) => {
  let accountInfo = await connection.getAccountInfo(appStateId);
  return new AppState(AppStateSchema.decode(accountInfo?.data));
};
export const findTotalAccInterest24Hrs = async (
  connection: Connection,
  appState: AppState | null = null
) => {
  try {
    let userDataPDAs = await connection.getProgramAccounts(stakeProgramId, {
      encoding: "base64",
    });
    let totalInterest = new Decimal(0);
    let curTimeS = parseInt((Date.now() / 1000).toString());
    let startTimeS = curTimeS - 86400;
    if (!appState) {
      appState = await getAppState(connection);
    }

    for (let i = 0; i < userDataPDAs.length; i++) {
      let userPDA = userDataPDAs[i];
      if (userPDA.pubkey.toString() === appStateId.toString()) continue;
      //temporary check (for backwards compatibility)
      if (
        userPDA.pubkey.toString() ==
        "9X319Qk5wa4bQn3DZDBCpRxDv1V3rAAg3Q2WM1GVvmMR"
      )
        continue;
      let user = new User(UserSchema.decode(userPDA.account.data));
      totalInterest = totalInterest.add(
        calculate24HrInterestUser(user, appState, startTimeS, curTimeS)
      );
    }
    return totalInterest;
  } catch (error) {
    console.log("Calculate Interest error", error);
    return new Decimal(0);
  }
};

export const getInterestStandBy = async (
  connection: Connection,
  appState: AppState | null = null
) => {
  try {
    let userDataPDAs = await connection.getProgramAccounts(stakeProgramId);
    let totalInterest = new Decimal(0);
    if (!appState) {
      appState = await getAppState(connection);
    }
    for (let i = 0; i < userDataPDAs.length; i++) {
      let userPDA = userDataPDAs[i];
      if (userPDA.pubkey.toString() === appStateId.toString()) continue;
      //temporary check (for backwards compatibility)
      if (
        userPDA.pubkey.toString() ==
        "9X319Qk5wa4bQn3DZDBCpRxDv1V3rAAg3Q2WM1GVvmMR"
      )
        continue;
      let user = new User(UserSchema.decode(userPDA.account.data));
      totalInterest = totalInterest.add(user.availableInterest(appState));
    }
    return totalInterest;
  } catch (error) {
    console.log("Calculate Interest error", error);
    return new Decimal(0);
  }
};
