import * as borsh from "@coral-xyz/borsh";
import Decimal from "decimal.js";

export interface ISale {
  token_amount: Decimal; // u64
  paid_amount: Decimal; // u64
  is_usdt: boolean; // bool
  user: Uint8Array; // Pubkey (32 bytes)
  time: Date;
}

export class Sale implements ISale {
  token_amount: Decimal;
  paid_amount: Decimal;
  is_usdt: boolean;
  user: Uint8Array;
  time: Date;

  constructor(data: any) {
    this.token_amount = new Decimal((data.token_amount || 0).toString());
    this.paid_amount = new Decimal((data.paid_amount || 0).toString());
    this.is_usdt = data.is_usdt || false;
    this.user = Uint8Array.from(data.user || []);
    this.time = new Date((data.time || 0) * 1000);
  }

  // Static method to parse raw data into Sale
  static parse(data: ISale): Sale {
    return new Sale(data);
  }
}

// Define Sale schema
export const SaleSchema = borsh.struct([
  borsh.u64("token_amount"), // u64
  borsh.u64("paid_amount"), // u64
  borsh.bool("is_usdt"), // bool
  borsh.publicKey("user"), // Pubkey (32 bytes)
  borsh.u64("time"),
]);
