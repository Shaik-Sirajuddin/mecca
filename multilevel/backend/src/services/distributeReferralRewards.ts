import {
  AccountMeta,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { UserData } from "../schema/user_data";
import queueManager from "../utils/distributeQueue";
import {
  connection,
  getUserDataAcc,
  getUserStoreAcc,
  sendDistributeTransaction,
} from "../utils/web3";
import { getUserData, storeUserData } from "./redisStore";
import {
  appStateId,
  appStoreId,
  multilevelProgramId,
  payerAcc,
} from "../constants";
import { sleep } from "../utils/utils";

let distributing = false;

const distributeRewardsOfUser = async (user: PublicKey) => {
  try {
    let userDataAcc = getUserDataAcc(user);
    let userDataAccount = await connection.getAccountInfo(
      userDataAcc,
      "confirmed"
    );
    let deserializedData = UserData.schema.decode(userDataAccount?.data);
    let userData = new UserData(deserializedData);
    storeUserData(user, userData);
    if (userData.referral_distribution.completed) return true;
    //TODO : queue stuck at user , in case a user distribution fails
    //ideally a distribution shoudn't fail
    let referrerAccounts: AccountMeta[] = [];
    let prevDistributed = userData.referral_distribution.last_distributed_user;
    for (let i = 0; i < 10; i++) {
      let prevUserDataAccount = await getUserData(prevDistributed);
      if (prevUserDataAccount.referrer === prevDistributed) break;
      let referrerDataAcc = getUserDataAcc(prevUserDataAccount.referrer);
      let referrerStoreAcc = getUserStoreAcc(prevUserDataAccount.referrer);

      referrerAccounts.push({
        pubkey: referrerDataAcc,
        isWritable: true,
        isSigner: false,
      });
      referrerAccounts.push({
        pubkey: referrerStoreAcc,
        isWritable: true,
        isSigner: false,
      });
      prevDistributed = prevUserDataAccount.referrer;
    }

    let instruction_accounts: AccountMeta[] = [
      {
        pubkey: payerAcc,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: userDataAcc,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: userData.referral_distribution.last_distributed_user,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: appStateId,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ];
    await sendDistributeTransaction(
      instruction_accounts.concat(...referrerAccounts)
    );
    await sleep(2000);
    await distributeRewardsOfUser(user);
  } catch (error) {
    console.log(error);
  }
};

export const distributeReferralRewards = async () => {
  try {
    if (distributing) return;
    distributing = true;
    let user = queueManager.pop()?.address;
    if (!user) return;
    await distributeRewardsOfUser(user);
  } catch (error) {
    console.log(error);
  } finally {
    distributing = false;
  }
};
