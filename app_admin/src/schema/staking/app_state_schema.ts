import * as borsh from "@coral-xyz/borsh";
import { Config, ConfigSchema } from "./config";
import { RateChange, RateChangeSchema } from "./rate_change";
import Decimal from "decimal.js";
import { PublicKey } from "@solana/web3.js";
import { stakeProgramId } from "../../pages/staking/utils/constants";

export interface IAppState {
  user_count: number; // u32
  total_registered: number; // u32
  staked_amount: Decimal; // u64
  deposit_threshould: Decimal; // u32
  min_interest_rate: number; // u32
  cur_interest_rate: number; // u32
  interest_history: RateChange[];
  config: Config;
  authority: PublicKey; // Pubkey (32 bytes)
}

export class AppState implements IAppState {
  user_count: number; // u32
  total_registered: number; // u32
  staked_amount: Decimal; // u64
  deposit_threshould: Decimal; // u32
  min_interest_rate: number; // u32
  cur_interest_rate: number; // u32
  interest_history: RateChange[];
  config: Config;
  authority: PublicKey; // Pubkey (32 bytes)

  constructor(data: any) {
    this.user_count = data.user_count || 0;
    this.total_registered = data.total_registered || 0;
    this.staked_amount = new Decimal((data.staked_amount || 0).toString());
    this.deposit_threshould = new Decimal(
      (data.user_threshould || 0).toString()
    );
    this.min_interest_rate = data.min_interest_rate || 0;
    this.cur_interest_rate = data.cur_interest_rate || 0;
    this.interest_history = (data.interest_history || []).map(RateChange.parse);
    this.config = Config.parse(
      (data.config && data.config.length ? data.config[0] : {}) || {}
    );
    console.log(data.authority)
    this.authority = new PublicKey(data.authority || stakeProgramId);
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

  static dummy() {
    return new AppState({});
  }
}

// Define AppState schema
export const AppStateSchema = borsh.struct([
  borsh.u32("user_count"), // u32
  borsh.u32("total_registered"), // u32
  borsh.u64("staked_amount"), // u64
  borsh.u64("deposit_threshould"), // u32
  borsh.u32("min_interest_rate"), // u32
  borsh.u32("cur_interest_rate"), // u32
  borsh.vec(RateChangeSchema, "interest_history"), // Vec<RateChange>
  borsh.array(ConfigSchema, 1, "config"), //config
  borsh.publicKey("authority"), // Pubkey (32 bytes)
]);
