import { AccountMeta, PublicKey } from "@solana/web3.js";
import { UserData } from "../schema/user_data";
import queueManager from "../utils/distributeQueue";
import {
  connection,
  fetchUserDataFromNode,
  getUserDataAcc,
  sendDistributeTransaction,
} from "../utils/web3";
import { sleep } from "../utils/utils";
import { getUserData, storeUserData } from "../database/user";
import { appStateId, payerAcc } from "../constants";
import * as borsh from "@coral-xyz/borsh";
import { RewardSchema } from "../schema/reward";
import { DistributeResonse } from "../schema/distribute_response";
import ReferralReward from "../models/referral_reward";

let distributing = false;

export const extractRewardsFromHash = async (signature: string) => {
  try {
    let tx = await connection.getTransaction(signature, {
      commitment: "confirmed",
    });
    //@ts-expect-error this
    let returnData = tx?.meta.returnData.data;
    const schema = borsh.struct([
      borsh.publicKey("address"),
      borsh.vec(RewardSchema, "rewards"),
    ]);
    let buffer = Buffer.from(returnData[0], "base64");
    const parsedData = new DistributeResonse(schema.decode(buffer));

    for (let i = 0; i < parsedData.rewards.length; i++) {
      let reward = parsedData.rewards[i];
      await ReferralReward.findOrCreate({
        defaults: {
          address: reward.user.toString(),
          from: parsedData.address.toString(),
          hash: signature,
          invested_amount: reward.invested_amount.toNumber(),
          level: reward.level,
          plan_entry_time: reward.plan_entry_time.toNumber(),
          plan_id: reward.plan_id,
          reward_amount: reward.reward_amount.toNumber(),
          reward_time: reward.reward_time.toNumber(),
        },
        where: {
          hash: signature,
          address: reward.user.toString(),
        },
      });
    }
  } catch (error) {
    console.log(error);
  }
};
const getDistributeTransactonAccountList = async (
  user: PublicKey,
  userData: UserData,
  prevDistributed: PublicKey
) => {
  let accountList: AccountMeta[][] = [];
  let i = 1;
  while (i > 0) {
    let instructionMetaData = await getReferrerAccountsForInstruction(
      prevDistributed
    );
    if (instructionMetaData.referrerAccounts.length == 0) break;
    let instruction_accounts: AccountMeta[] = [
      {
        pubkey: getUserDataAcc(user),
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: getUserDataAcc(prevDistributed),
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: appStateId,
        isSigner: false,
        isWritable: false,
      },
    ];
    accountList.push(
      instruction_accounts.concat(instructionMetaData.referrerAccounts)
    );
    prevDistributed = instructionMetaData.prevDistributed;
    console.log(prevDistributed);
    i--;
  }
  return accountList;
};
const getReferrerAccountsForInstruction = async (
  prevDistributed: PublicKey
) => {
  let referrerAccounts: AccountMeta[] = [];
  for (let i = 0; i < 5; i++) {
    let prevUserDataAccount = new UserData(await getUserData(prevDistributed));
    if (prevUserDataAccount.referrer.equals(prevDistributed)) break;
    let referrerDataAcc = getUserDataAcc(prevUserDataAccount.referrer);
    referrerAccounts.push({
      pubkey: referrerDataAcc,
      isWritable: true,
      isSigner: false,
    });
    prevDistributed = prevUserDataAccount.referrer;
  }
  return { referrerAccounts, prevDistributed };
};
export const distributeRewardsOfUser = async (user: PublicKey) => {
  try {
    let userData = await fetchUserDataFromNode(user);
    storeUserData(user, userData);
    if (userData.referral_distribution.completed) {
      console.log("distribution completed for user", user.toString());
      return true;
    }
    //TODO : queue stuck at user , in case a user distribution fails
    //ideally a distribution shoudn't fail
    let prevDistributed = userData.referral_distribution.last_distributed_user;
    let accountList = await getDistributeTransactonAccountList(
      user,
      userData,
      prevDistributed
    );
    if (accountList.length == 0) {
      //no transaction is needed as max level reached
      //case shoudn't occur
      return;
    }
    let txSignature = await sendDistributeTransaction(accountList);
    if (txSignature) {
      extractRewardsFromHash(txSignature);
      await sleep(3000);
      await distributeRewardsOfUser(user);
    } else {
      //transaction failed
      setTimeout(() => {
        queueManager.verifyAndAdd(user);
      }, 5000);
    }
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
