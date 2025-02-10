import { PublicKey } from "@solana/web3.js";
import { Reward } from "./reward";
import Decimal from "decimal.js";

export interface IUserStore {
  address: PublicKey;
  rewards: Reward[];
}

export class UserStore implements IUserStore {
  address: PublicKey;
  rewards: Reward[];

  constructor(data: any) {
    this.address = new PublicKey(data.address || PublicKey.default);
    this.rewards = (data.rewards || []).map(
      (reward: any) => new Reward(reward)
    );
  }

  getCrewCount() {
    const crewCount = {
      direct: 0,
      active: 0,
      deep: 0,
    };
    const accounted = new Set<string>();
    for (let i = 0; i < this.rewards.length; i++) {
      const reward = this.rewards[i];
      if (accounted.has(reward.from.toString())) continue;
      accounted.add(reward.from.toString());
      if (reward.level === 1) {
        crewCount.direct++;
      } else if (reward.level <= 6) {
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
        crewProfit.direct = crewProfit.direct.add(reward.reward_amount);
      } else if (reward.level <= 6) {
        crewProfit.active = crewProfit.active.add(reward.reward_amount);
      } else {
        crewProfit.deep = crewProfit.deep.add(reward.reward_amount);
      }
    }
    return crewProfit;
  }

  static dummy() {
    return new UserStore({});
  }

  // Convert UserStore instance to JSON
  toJSON() {
    return {
      address: this.address.toBase58(),
      rewards: this.rewards.map((reward) => reward.toJSON()),
    };
  }

  // Convert JSON to UserStore instance
  static fromJSON(json: Record<string, any>): UserStore {
    return new UserStore({
      address: new PublicKey(json.address),
      rewards: (json.rewards || []).map((reward: any) =>
        Reward.fromJSON(reward)
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
