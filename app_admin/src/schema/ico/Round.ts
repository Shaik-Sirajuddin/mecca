import * as borsh from "@coral-xyz/borsh";

import Decimal from "decimal.js";

export interface IRound {
  idx: number; // u32
  round_price: Decimal; // u64
  price_decimals: number; // u8
  end_time: Date; // u64
}

export class Round implements IRound {
  idx: number;
  round_price: Decimal;
  price_decimals: number;
  end_time: Date;

  constructor(data: any) {
    this.idx = data.idx || 0;
    this.round_price = new Decimal((data.round_price || 0).toString());
    this.price_decimals = data.price_decimals || 0;
    this.end_time = new Date((data.end_time || 0) * 1000);
  }

  // Static method to parse raw data into Round
  static parse(data: IRound): Round {
    return new Round(data);
  }
}

// Define Round schema
export const RoundSchema = borsh.struct([
  borsh.u32("idx"), // u32
  borsh.u64("round_price"), // u64
  borsh.u8("price_decimals"), // u8
  borsh.u64("end_time"), // u64
]);
