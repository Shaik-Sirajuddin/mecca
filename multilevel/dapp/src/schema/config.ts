import * as borsh from "@coral-xyz/borsh";
import Decimal from "decimal.js";

export interface IConfig {
  lock_time_principal: Decimal; // u64
  lock_time_interest: Decimal; // u64
  min_deposit_user: Decimal; // u64
  max_deposit_user: Decimal; // u64
}

export class Config implements IConfig {
  lock_time_principal: Decimal;
  lock_time_interest: Decimal;
  min_deposit_user: Decimal; // u64
  max_deposit_user: Decimal; // u64

  constructor(data: IConfig) {
    this.lock_time_principal = new Decimal(
      (data.lock_time_principal || 30 * 86400).toString()
    );
    this.lock_time_interest = new Decimal(
      (data.lock_time_interest || 0).toString()
    );
    this.min_deposit_user = new Decimal(
      (data.min_deposit_user || 0).toString()
    );
    this.max_deposit_user = new Decimal(
      (data.max_deposit_user || 0).toString()
    );
  }

  // Static method to parse raw data into Config
  static parse(data: IConfig): Config {
    return new Config(data);
  }
}

// Define Config schema
export const ConfigSchema = borsh.struct([
  borsh.u64("lock_time_principal"), // u64
  borsh.u64("lock_time_interest"), // u64
  borsh.u64("min_deposit_user"),
  borsh.u64("max_deposit_user"),
]);
