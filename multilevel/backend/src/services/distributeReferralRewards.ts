import { AccountMeta, PublicKey, SystemProgram } from "@solana/web3.js";
import { UserData } from "../schema/user_data";
import queueManager from "../utils/distributeQueue";
import {
  fetchUserDataFromNode,
  getUserDataAcc,
  getUserStoreAcc,
  sendDistributeTransaction,
} from "../utils/web3";
import { sleep } from "../utils/utils";
import { getUserData, storeUserData } from "../database/user";
import { appStateId, payerAcc } from "../constants";

let distributing = false;

const getDistributeTransactonAccountList = async(user : PublicKey , userData : UserData ,prevDistributed : PublicKey) => {
    let accountList : AccountMeta[][] = []
    let i = 5;
    while(i>0){
       let instructionMetaData = await getReferrerAccountsForInstruction(prevDistributed)
       if(instructionMetaData.referrerAccounts.length == 0)break;
       let instruction_accounts: AccountMeta[] = [
        {
          pubkey: payerAcc,
          isSigner: true,
          isWritable: true,
        },
        {
          pubkey: getUserDataAcc(user),
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: getUserDataAcc(
            prevDistributed
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
       accountList.push(instruction_accounts.concat(instructionMetaData.referrerAccounts))
       prevDistributed = instructionMetaData.prevDistributed
       console.log(prevDistributed)
       i--
    }
    return accountList
}
const getReferrerAccountsForInstruction = async (prevDistributed : PublicKey) => {
  let referrerAccounts: AccountMeta[] = [];
  for (let i = 0; i < 2; i++) {
    let prevUserDataAccount = new UserData(
      await getUserData(prevDistributed)
    );
    if (prevUserDataAccount.referrer.equals(prevDistributed)) break;
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
  return {referrerAccounts , prevDistributed}
}
const distributeRewardsOfUser = async (user: PublicKey) => {
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
    let accountList = await getDistributeTransactonAccountList(user ,userData,prevDistributed)
    if(accountList.length == 0){
      //no transaction is needed as max level reached
      //case shoudn't occur 
      return;
    }
    if(await sendDistributeTransaction(
      accountList
    )){
      await sleep(3000);
      await distributeRewardsOfUser(user);
    }else{
      //transaction failed 
      setTimeout(()=>{
          queueManager.verifyAndAdd(user)
      },5000)
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

