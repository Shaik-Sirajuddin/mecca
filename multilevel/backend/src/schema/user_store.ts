import * as borsh from "@coral-xyz/borsh";
import { PublicKey } from "@solana/web3.js";
import { Reward, RewardSchema } from "./reward";
import { UserAction, UserActionSchema } from "./action";

export interface IUserStore {
  address: PublicKey;
  rewards: Reward[];
  actions: UserAction[];
}

export class UserStore implements IUserStore {
  address: PublicKey;
  rewards: Reward[];
  actions: UserAction[];

  constructor(data: any) {
    this.address = new PublicKey(data.address);
    this.rewards = (data.rewards || []).map(
      (reward: any) => new Reward(reward)
    );
    this.actions = (data.actions || []).map(
      (action: any) => new UserAction(action)
    );
  }

  static schema = borsh.struct([
    borsh.publicKey("address"),
    borsh.vec(RewardSchema, "rewards"),
    borsh.vec(UserActionSchema, "actions"),
  ]);
}
