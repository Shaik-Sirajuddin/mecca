import * as borsh from "@coral-xyz/borsh";
import { PublicKey } from "@solana/web3.js";
import Decimal from "decimal.js";

export interface IReward {
  user: PublicKey; // Public key of the user
  invested_amount: Decimal; // Amount invested during enroll or upgrade (u64)
  level: number; // Level (u8)
  plan_id: number; // Plan ID (u8)
  reward_amount: Decimal; // Reward amount (u64)
  reward_time: Decimal; // Reward time (u64)
  plan_entry_time: Decimal; // Plan entry time (u64)
}

export class Reward implements IReward {
  user: PublicKey;
  invested_amount: Decimal;
  level: number;
  plan_id: number;
  reward_amount: Decimal;
  reward_time: Decimal;
  plan_entry_time: Decimal;

  constructor(data: any) {
    this.user = new PublicKey(data.user || new Uint8Array(32));
    this.invested_amount = new Decimal((data.invested_amount || 0).toString());
    this.level = data.level || 0;
    this.plan_id = data.plan_id || 0;
    this.reward_amount = new Decimal((data.reward_amount || 0).toString());
    this.reward_time = new Decimal((data.reward_time || 0).toString());
    this.plan_entry_time = new Decimal((data.plan_entry_time || 0).toString());
  }

  // Static method to parse raw data into Reward
  static parse(data: IReward): Reward {
    return new Reward(data);
  }

  // Example dummy Reward for testing purposes
  static dummy(): Reward {
    return new Reward({
      user: new PublicKey("6u...example_pubkey"),
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
      user: this.user.toBase58(),
      invested_amount: this.invested_amount.toString(),
      level: this.level,
      plan_id: this.plan_id,
      reward_amount: this.reward_amount.toString(),
      reward_time: this.reward_time.toString(),
      plan_entry_time: this.plan_entry_time.toString(),
    };
  }

  // Deserialize from JSON
  static fromJSON(json: Record<string, any>): Reward {
    return new Reward({
      user: new PublicKey(json.user),
      invested_amount: new Decimal(json.invested_amount),
      level: json.level,
      plan_id: json.plan_id,
      reward_amount: new Decimal(json.reward_amount),
      reward_time: new Decimal(json.reward_time),
      plan_entry_time: new Decimal(json.plan_entry_time),
    });
  }
}

// Define Reward schema for borsh
export const RewardSchema = borsh.struct([
  borsh.publicKey("user"), // Pubkey (32 bytes)
  borsh.u64("invested_amount"), // u64
  borsh.u8("level"), // u8
  borsh.u8("plan_id"), // u8
  borsh.u64("reward_amount"), // u64
  borsh.u64("reward_time"), // u64
  borsh.u64("plan_entry_time"), // u64
]);
