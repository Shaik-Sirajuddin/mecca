import * as borsh from "@coral-xyz/borsh";
import { PublicKey } from "@solana/web3.js";
import { Plan, PlanSchema } from "./plan";
import Decimal from "decimal.js";
import { PlanID } from "../enums/plan";

export interface IAppState {
  daily_fee: Decimal; // u64
  paused: boolean; // bool
  plans: Plan[]; // Fixed size of 3 plans
  owner: PublicKey; // Public key of the owner
}

export class AppState implements IAppState {
  daily_fee: Decimal;
  paused: boolean;
  plans: Plan[];
  owner: PublicKey;

  constructor(data: any) {
    this.daily_fee = new Decimal((data.daily_fee || 0).toString());
    this.paused = data.paused || false;
    this.plans = (data.plans || []).map((plan: any) => Plan.parse(plan));
    if (this.plans.length !== 3) {
      throw new Error("AppState must contain exactly 3 plans.");
    }
    this.owner = new PublicKey(data.owner || new Uint8Array(32));
  }

  // Static method to parse raw data into AppState
  static parse(data: IAppState): AppState {
    return new AppState(data);
  }

  // Example dummy AppState for testing purposes
  static dummy(): AppState {
    return new AppState({
      daily_fee: new Decimal(1),
      paused: false,
      plans: [Plan.dummy(), Plan.dummy(), Plan.dummy()],
      owner: PublicKey.default,
    });
  }

  getPlan = (planId: PlanID) => {
    if (planId > 2) return null;
    return this.plans[planId];
  };

  // Serialize to JSON-friendly format
  toJSON(): Record<string, any> {
    return {
      daily_fee: this.daily_fee.toString(), // Decimal as string
      paused: this.paused,
      plans: this.plans.map((plan) => plan.toJSON()), // Assuming Plan has toJSON
      owner: this.owner.toBase58(), // PublicKey as string
    };
  }

  // Deserialize from JSON-friendly format
  static fromJSON(json: any): AppState {
    return new AppState({
      daily_fee: new Decimal(json.daily_fee),
      paused: json.paused,
      plans: json.plans.map((plan: any) => Plan.fromJSON(plan)), // Assuming Plan has fromJSON
      owner: new PublicKey(json.owner),
    });
  }
}

// Define AppState schema for borsh
export const AppStateSchema = borsh.struct([
  borsh.u64("daily_fee"), // u64
  borsh.bool("paused"), // bool
  borsh.vec(PlanSchema, "plans"), // Vec<Plan> (fixed size of 3 should be enforced in code)
  borsh.publicKey("owner"), // Pubkey (32 bytes)
]);
