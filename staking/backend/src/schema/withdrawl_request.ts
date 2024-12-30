import * as borsh from "@coral-xyz/borsh";

export interface IWithdrawRequest {
  amount: bigint; // u64
  request_time_ms: bigint; // u64
  is_principal: boolean;
  is_under_progress: boolean;
}

export class WithdrawRequest implements IWithdrawRequest {
  amount: bigint; // u64
  request_time_ms: bigint; // u64
  is_principal: boolean;
  is_under_progress: boolean;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(data: any) {
    this.amount = BigInt(data.amount || 0);
    this.request_time_ms = BigInt(data.request_time_ms || 0);
    this.is_principal = !!data.is_principal;
    this.is_under_progress = !!data.is_under_progress;
  }

  static parse(data: IWithdrawRequest): WithdrawRequest {
    return new WithdrawRequest(data);
  }

  // Method to check if withdrawal is possible
  canWithdraw(lock_time_ms: bigint, current_time_ms: bigint): boolean {
    return (
      this.is_under_progress &&
      this.request_time_ms + lock_time_ms <= current_time_ms
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
