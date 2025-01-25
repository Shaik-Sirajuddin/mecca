import * as borsh from "@coral-xyz/borsh";
import Decimal from "decimal.js";

export interface IPlan {
  id: number; // u8
  investment_required: Decimal; // u64
  validity_days: number; // u32
  daily_reward: Decimal; // u64
  max_level: number; // u8
  direct_referral_percentage: number; // u8
  active_referral_percentage: number; // u8
  deep_referral_percentage: number; // u8
}

export class Plan implements IPlan {
  id: number;
  investment_required: Decimal;
  validity_days: number;
  daily_reward: Decimal;
  max_level: number;
  direct_referral_percentage: number;
  active_referral_percentage: number;
  deep_referral_percentage: number;

  constructor(data: any) {
    this.id = data.id || 0;
    this.investment_required = new Decimal(
      (data.investment_required || 0).toString()
    );
    this.validity_days = data.validity_days || 0;
    this.daily_reward = new Decimal((data.daily_reward || 0).toString());
    this.max_level = data.max_level || 0;
    this.direct_referral_percentage = data.direct_referral_percentage || 0;
    this.active_referral_percentage = data.active_referral_percentage || 0;
    this.deep_referral_percentage = data.deep_referral_percentage || 0;
  }

  // Static method to parse raw data into Plan
  static parse(data: IPlan): Plan {
    return new Plan(data);
  }

  // Example dummy plan for testing purposes
  static dummy(): Plan {
    return new Plan({
      id: 1,
      investment_required: new Decimal(1000),
      validity_days: 2000,
      daily_reward: new Decimal(10),
      max_level: 10,
      direct_referral_percentage: 5,
      active_referral_percentage: 3,
      deep_referral_percentage: 2,
    });
  }

  // Convert instance to JSON (serializable object)
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      investment_required: this.investment_required.toString(),
      validity_days: this.validity_days,
      daily_reward: this.daily_reward.toString(),
      max_level: this.max_level,
      direct_referral_percentage: this.direct_referral_percentage,
      active_referral_percentage: this.active_referral_percentage,
      deep_referral_percentage: this.deep_referral_percentage,
    };
  }

  // Create a Plan instance from JSON
  static fromJSON(json: IPlan): Plan {
    return new Plan({
      id: json.id,
      investment_required: json.investment_required,
      validity_days: json.validity_days,
      daily_reward: json.daily_reward,
      max_level: json.max_level,
      direct_referral_percentage: json.direct_referral_percentage,
      active_referral_percentage: json.active_referral_percentage,
      deep_referral_percentage: json.deep_referral_percentage,
    });
  }
}

// Define Plan schema for borsh
export const PlanSchema = borsh.struct([
  borsh.u8("id"), // u8
  borsh.u64("investment_required"), // u64
  borsh.u32("validity_days"), // u32
  borsh.u64("daily_reward"), // u64
  borsh.u8("max_level"), // u8
  borsh.u8("direct_referral_percentage"), // u8
  borsh.u8("active_referral_percentage"), // u8
  borsh.u8("deep_referral_percentage"), // u8
]);
