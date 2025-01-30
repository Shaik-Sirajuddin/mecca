import { PublicKey } from "@solana/web3.js";
import { connection, fetchUserDataFromNode, getUserDataAcc } from "./web3";
import { UserData } from "../schema/user_data";

interface QueueItem {
  address: PublicKey;
  enrolledAt: Date;
}
const queue: QueueItem[] = [];

const queueManager = {
  contains: (address: PublicKey) => {
    if (queue.find((item) => item.address === address)) {
      return true;
    }
    return false;
  },
  verifyAndAdd: async (address: PublicKey) => {
    try {
      if (queueManager.contains(address)) return false;
      let userData = await fetchUserDataFromNode(address);
      let enrolledAt = new Date(userData.enrolled_at.toNumber() * 1000);
      if (userData.referral_distribution.completed) return false;
      queue.push({
        address,
        enrolledAt,
      });
      //sort in descending order
      queue.sort((a, b) => {
        return b.enrolledAt.getTime() - a.enrolledAt.getTime();
      });
    } catch (error) {
      return false;
    }
    return true;
  },
  top: () => {
    if (queue.length === 0) {
      return undefined;
    }
    return queue[queue.length - 1];
  },
  pop: () => {
    return queue.pop();
  },
};

export default queueManager;
