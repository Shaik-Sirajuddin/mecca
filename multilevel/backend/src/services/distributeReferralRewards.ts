import { UserData } from "../schema/user_data";
import queueManager from "../utils/distributeQueue";
import { connection, getUserDataAcc } from "../utils/web3";

let distributing = false;
export const distributeReferralRewards = async () => {
  try {
    if (distributing) return;
    distributing = true;
    let user = queueManager.pop()?.address;
    if (!user) return;
    let userDataAcc = getUserDataAcc(user);
    let userDataAccount = await connection.getAccountInfo(userDataAcc);
    let deserializedData = UserData.schema.decode(userDataAccount?.data);
    let userData = new UserData(deserializedData);
    
  } catch (error) {
    console.log(error);
  } finally {
    distributing = false;
  }
};
