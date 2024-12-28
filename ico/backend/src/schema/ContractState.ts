import * as borsh from "@coral-xyz/borsh";
import Decimal from "decimal.js";

export interface ISale {
  token_amount: Decimal; // u64
  paid_amount: Decimal; // u64
  is_usdt: boolean; // bool
  user: Uint8Array; // Pubkey (32 bytes)
}

export class Sale implements ISale {
  token_amount: Decimal;
  paid_amount: Decimal;
  is_usdt: boolean;
  user: Uint8Array;

  constructor(data: any) {
    this.token_amount = new Decimal((data.token_amount || 0).toString());
    this.paid_amount = new Decimal((data.paid_amount || 0).toString());
    this.is_usdt = data.is_usdt || false;
    this.user = Uint8Array.from(data.user || []);
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
]);

export interface IContractState {
  tokens_sold: Decimal; // u64
  usdt_raised: Decimal; // u64
  sol_raised: Decimal; // u64
  owner: Uint8Array; // Pubkey (32 bytes)
  sales: Sale[]; // Vec<Sale>
}

export class ContractState implements IContractState {
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
  static parse(data: IContractState): ContractState {
    return new ContractState(data);
  }

  // Method to split sales into smaller chunks for storage optimization
  splitSales(chunkSize: number): Sale[][] {
    const chunks: Sale[][] = [];
    for (let i = 0; i < this.sales.length; i += chunkSize) {
      chunks.push(this.sales.slice(i, i + chunkSize));
    }
    return chunks;
  }

  static dummy() {
    return new ContractState({});
  }
}

// Define AppState schema
export const ContractStateSchema = borsh.struct([
  borsh.u64("tokens_sold"), // u64
  borsh.u64("usdt_raised"), // u64
  borsh.u64("sol_raised"), // u64
  borsh.publicKey("owner"), // Pubkey (32 bytes)
  borsh.vec(SaleSchema, "sales"), // Vec<Sale>
]);
