import * as borsh from "@coral-xyz/borsh";
import { Config, ConfigSchema } from "./config";
import { RateChange, RateChangeSchema } from "./rate_change";
import Decimal from "decimal.js";
import { splToken } from "../utils/constants";

export interface IAppState {
  user_count: number; // u32
  total_registered: number; // u32
  staked_amount: Decimal; // u64
  user_threshould: number; // u32
  min_interest_rate: number; // u32
  cur_interest_rate: number; // u32
  min_deposit_user: Decimal;
  max_depoist_user: Decimal;
  interest_history: RateChange[];
  config: Config;
  authority: Uint8Array; // Pubkey (32 bytes)
}

export class AppState implements IAppState {
  user_count: number; // u32
  total_registered: number; // u32
  staked_amount: Decimal; // u64
  user_threshould: number; // u32
  min_interest_rate: number; // u32
  cur_interest_rate: number; // u32
  interest_history: RateChange[];
  config: Config;
  authority: Uint8Array; // Pubkey (32 bytes)
  min_deposit_user: Decimal;
  max_depoist_user: Decimal;

  constructor(data: any) {
    console.log("Data", data);
    this.user_count = data.user_count || 0;
    this.total_registered = data.total_registered || 0;
    this.staked_amount = new Decimal((data.staked_amount || 0).toString());
    this.user_threshould = data.user_threshould || 0;
    this.min_interest_rate = data.min_interest_rate || 0;
    this.cur_interest_rate = data.cur_interest_rate || 0;
    this.interest_history = (data.interest_history || []).map(RateChange.parse);
    this.config = Config.parse(data.config || {});
    this.authority = Uint8Array.from(data.authority || []);
    this.min_deposit_user = new Decimal(
      (
        data.min_deposit_user || 1000 * Math.pow(10, splToken.decimals)
      ).toString()
    );
    this.max_depoist_user = new Decimal(
      (
        data.max_depoist_user || 1000 * Math.pow(10, splToken.decimals)
      ).toString()
    );
  }

  // Function to calculate total interest rate change
  calculateTotalInterestChange(): number {
    return this.interest_history.reduce(
      (total, record) => total + record.rate,
      0
    );
  }

  // Static method to parse raw data into AppState
  static parse(data: IAppState): AppState {
    return new AppState(data);
  }
}

// Define AppState schema
export const AppStateSchema = borsh.struct([
  borsh.u32("user_count"), // u32
  borsh.u32("total_registered"), // u32
  borsh.u64("staked_amount"), // u64
  borsh.u32("user_threshould"), // u32
  borsh.u32("min_interest_rate"), // u32
  borsh.u32("cur_interest_rate"), // u32
  borsh.vec(RateChangeSchema, "interest_history"), // Vec<RateChange>
  ConfigSchema, // Config
  borsh.publicKey("authority"), // Pubkey (32 bytes)
]);
