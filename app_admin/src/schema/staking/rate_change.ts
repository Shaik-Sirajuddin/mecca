import * as borsh from "@coral-xyz/borsh";
import Decimal from "decimal.js";

export interface IRateChange {
  time: Decimal; // u64
  rate: number; // u32
}

export class RateChange implements IRateChange {
  time: Decimal; // u64
  rate: number; // u32

  constructor(data: IRateChange) {
    this.time = new Decimal((data.time || 0).toString());
    this.rate = data.rate || 0;
  }

  // Static method to parse raw data into RateChange
  static parse(data: IRateChange): RateChange {
    return new RateChange(data);
  }
}

// Define RateChange schema
export const RateChangeSchema = borsh.struct([
  borsh.u64("time"), // u64
  borsh.u32("rate"), // u32
]);
