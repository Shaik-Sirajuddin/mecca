import { PublicKey } from "@solana/web3.js";
import { Reward } from "./reward";

export interface IDistributeResonse {
  address: PublicKey;
  rewards: Reward[];
}

export class DistributeResonse implements IDistributeResonse {
  address: PublicKey;
  rewards: Reward[];

  constructor(data: any) {
    this.address = new PublicKey(data.address || PublicKey.default);
    this.rewards = (data.rewards || []).map(
      (reward: any) => new Reward(reward)
    );
  }
}
