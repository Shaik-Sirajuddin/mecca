import * as borsh from "@coral-xyz/borsh";
import Decimal from "decimal.js";

export interface IWithdrawRequest {
  amount: Decimal; // u64
  request_time_ms: Decimal; // u64
  is_principal: boolean;
  is_under_progress: boolean;
}

export class WithdrawRequest implements IWithdrawRequest {
  amount: Decimal; // u64
  request_time_ms: Decimal; // u64
  is_principal: boolean;
  is_under_progress: boolean;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(data: any) {
    this.amount = new Decimal((data.amount || 0).toString());
    this.request_time_ms = new Decimal((data.request_time_ms || 0).toString());
    this.is_principal = data.is_principal || false;
    this.is_under_progress = data.is_under_progress || false;
  }

  static parse(data: IWithdrawRequest): WithdrawRequest {
    return new WithdrawRequest(data);
  }

  // Method to check if withdrawal is possible
  canWithdraw(lock_time_ms: number, current_time_ms: number): boolean {
    return (
      this.is_under_progress &&
      this.request_time_ms.toNumber() + lock_time_ms <= current_time_ms
    );
  }

  isInterest(): boolean {
    return !this.is_principal;
  }
}

export const WithdrawRequestSchema = borsh.struct([
  borsh.u64("amount"),
  borsh.u64("request_time_ms"),
  borsh.bool("is_principal"),
  borsh.bool("is_under_progress"),
]);
