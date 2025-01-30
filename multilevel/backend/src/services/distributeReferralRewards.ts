import { AccountMeta, PublicKey, SystemProgram } from "@solana/web3.js";
import { UserData } from "../schema/user_data";
import queueManager from "../utils/distributeQueue";
import {
  fetchUserDataFromNode,
  getUserDataAcc,
  getUserStoreAcc,
  sendDistributeTransaction,
} from "../utils/web3";
import { appStateId, payerAcc } from "../constants";
import { sleep } from "../utils/utils";
import { getUserData, storeUserData } from "../database/user";

let distributing = false;

const distributeRewardsOfUser = async (user: PublicKey) => {
  try {
    let userDataAcc = getUserDataAcc(user);
    let userData = await fetchUserDataFromNode(user);
    storeUserData(user, userData);
    if (userData.referral_distribution.completed) {
      console.log("distribution completed for user", user.toString());
      return true;
    }
    //TODO : queue stuck at user , in case a user distribution fails
    //ideally a distribution shoudn't fail
    let referrerAccounts: AccountMeta[] = [];
    let prevDistributed = userData.referral_distribution.last_distributed_user;
    for (let i = 0; i < 10; i++) {
      let prevUserDataAccount = new UserData(
        await getUserData(prevDistributed)
      );
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
        pubkey: getUserDataAcc(
          userData.referral_distribution.last_distributed_user
        ),
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
    await sleep(3000);
    await distributeRewardsOfUser(user);
  } catch (error) {
    console.log(error);
  }
};

export const distributeReferralRewards = async () => {
  try {
    if (distributing) {
      console.log("distributing return");
      return;
    }
    distributing = true;
    let user = queueManager.pop()?.address;
    if (!user) return;
    console.log("distribution started for user", user.toString());
    await distributeRewardsOfUser(user);
  } catch (error) {
    console.log(error);
  } finally {
    distributing = false;
  }
};
