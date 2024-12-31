import * as borsh from "@coral-xyz/borsh";
import Decimal from "decimal.js";
import { Sale, SaleSchema } from "./Sale";

export interface ISaleState {
  tokens_sold: Decimal; // u64
  usdt_raised: Decimal; // u64
  sol_raised: Decimal; // u64
  owner: Uint8Array; // Pubkey (32 bytes)
  sales: Sale[]; // Vec<Sale>
}

export class SaleState implements ISaleState {
  tokens_sold: Decimal;
  usdt_raised: Decimal;
  sol_raised: Decimal;
  owner: Uint8Array;
  sales: Sale[];

  constructor(data: any) {
    this.tokens_sold = new Decimal((data.tokens_sold || 0).toString());
    this.usdt_raised = new Decimal((data.usdt_raised || 0).toString());
    this.sol_raised = new Decimal((data.sol_raised || 0).toString());
    this.owner = Uint8Array.from(data.owner || []);
    this.sales = (data.sales || []).map(Sale.parse);
  }

  // Static method to parse raw data into AppState
  static parse(data: ISaleState): SaleState {
    return new SaleState(data);
  }

  static dummy() {
    return new SaleState({});
  }
}

// Define AppState schema
export const SaleStateSchema = borsh.struct([
  borsh.vec(SaleSchema, "sales"), // Vec<Sale>
]);
