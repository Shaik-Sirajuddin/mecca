import * as borsh from "@coral-xyz/borsh";
import { PublicKey } from "@solana/web3.js";
import { Reward, RewardSchema } from "./reward";
import { UserAction, UserActionSchema } from "./action";
import Decimal from "decimal.js";

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
    this.address = new PublicKey(data.address || PublicKey.default);
    this.rewards = (data.rewards || []).map(
      (reward: any) => new Reward(reward)
    );
    this.actions = (data.actions || []).map(
      (action: any) => new UserAction(action)
    );
  }

  getCrewCount() {
    const crewCount = {
      direct: 0,
      active: 0,
      deep: 0,
    };
    for (let i = 0; i < this.rewards.length; i++) {
      const reward = this.rewards[i];
      if (reward.level === 1) {
        crewCount.direct++;
      } else if (reward.level <= 7) {
        crewCount.active++;
      } else {
        crewCount.deep++;
      }
    }
    return crewCount;
  }

  getCrewProfit() {
    const crewProfit = {
      direct: new Decimal(0),
      active: new Decimal(0),
      deep: new Decimal(0),
    };
    for (let i = 0; i < this.rewards.length; i++) {
      const reward = this.rewards[i];
      if (reward.level === 1) {
        crewProfit.direct = crewProfit.direct.add(reward.invested_amount);
      } else if (reward.level <= 7) {
        crewProfit.active = crewProfit.active.add(reward.invested_amount);
      } else {
        crewProfit.deep = crewProfit.deep.add(reward.invested_amount);
      }
    }
    return crewProfit;
  }

  static dummy() {
    return new UserStore({});
  }

  static schema = borsh.struct([
    borsh.publicKey("address"),
    borsh.vec(RewardSchema, "rewards"),
    borsh.vec(UserActionSchema, "actions"),
  ]);

  // Convert UserStore instance to JSON
  toJSON() {
    return {
      address: this.address.toBase58(),
      rewards: this.rewards.map((reward) => reward.toJSON()),
      actions: this.actions.map((action) => action.toJSON()),
    };
  }

  // Convert JSON to UserStore instance
  static fromJSON(json: Record<string, any>): UserStore {
    return new UserStore({
      address: new PublicKey(json.address),
      rewards: (json.rewards || []).map((reward: any) =>
        Reward.fromJSON(reward)
      ),
      actions: (json.actions || []).map((action: any) =>
        UserAction.fromJSON(action)
      ),
    });
  }

  directReferred() {
    let directReferred = 0;
    for (let i = 0; i < this.rewards.length; i++) {
      const reward = this.rewards[i];
      if (reward.level === 1) {
        directReferred++;
      }
    }
    return directReferred;
  }
}
