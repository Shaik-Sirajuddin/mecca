import { PublicKey } from "@solana/web3.js";
import Decimal from "decimal.js";

export interface IReward {
  address: PublicKey; // Public key of the user
  from: PublicKey; // Public key of the user
  invested_amount: Decimal; // Amount invested during enroll or upgrade (u64)
  level: number; // Level (u8)
  plan_id: number; // Plan ID (u8)
  reward_amount: Decimal; // Reward amount (u64)
  reward_time: Decimal; // Reward time (u64)
  plan_entry_time: Decimal; // Plan entry time (u64)
  from_id: string;
}

export class Reward implements IReward {
  invested_amount: Decimal;
  level: number;
  plan_id: number;
  reward_amount: Decimal;
  reward_time: Decimal;
  plan_entry_time: Decimal;
  address: PublicKey;
  from: PublicKey;
  from_id: string;

  constructor(data: any) {
    this.address = new PublicKey(data.address || new Uint8Array(32));
    this.from = new PublicKey(data.from || new Uint8Array(32));
    this.invested_amount = new Decimal((data.invested_amount || 0).toString());
    this.level = data.level || 0;
    this.plan_id = data.plan_id || 0;
    this.reward_amount = new Decimal((data.reward_amount || 0).toString());
    this.reward_time = new Decimal((data.reward_time || 0).toString());
    this.plan_entry_time = new Decimal((data.plan_entry_time || 0).toString());
    this.from_id = data.from_id || "";
  }

  // Static method to parse raw data into Reward
  static parse(data: IReward): Reward {
    return new Reward(data);
  }

  // Example dummy Reward for testing purposes
  static dummy(): Reward {
    return new Reward({
      from: new PublicKey("6u...example_pubkey"),
      invested_amount: new Decimal(1000),
      level: 1,
      plan_id: 2,
      reward_amount: new Decimal(500),
      reward_time: new Decimal(parseInt((Date.now() / 1000).toString())), // Current time in seconds
      plan_entry_time: new Decimal(
        parseInt((Date.now() / 1000).toString()) - 3600
      ), // Current time in seconds
    });
  }

  // Serialize to JSON
  toJSON(): Record<string, any> {
    return {
      from: this.from.toBase58(),
      address: this.address.toBase58(),
      invested_amount: this.invested_amount.toString(),
      level: this.level,
      plan_id: this.plan_id,
      reward_amount: this.reward_amount.toString(),
      reward_time: this.reward_time.toString(),
      plan_entry_time: this.plan_entry_time.toString(),
      from_id: this.from_id.toString(),
    };
  }

  // Deserialize from JSON
  static fromJSON(json: Record<string, any>): Reward {
    return new Reward({
      from: new PublicKey(json.from),
      address: new PublicKey(json.address),
      invested_amount: new Decimal(json.invested_amount),
      level: json.level,
      plan_id: json.plan_id,
      reward_amount: new Decimal(json.reward_amount),
      reward_time: new Decimal(json.reward_time),
      plan_entry_time: new Decimal(json.plan_entry_time),
      from_id: json.from_id || "",
    });
  }
}
