import * as borsh from "@coral-xyz/borsh";

export interface IInterestWithdrawItn {
  amount: bigint; // u64
  is_complete_withdrawl: boolean;
}

export class InterestWithdrawItn implements IInterestWithdrawItn {
  amount: bigint; // u64
  is_complete_withdrawl: boolean;

  constructor(data: any) {
    this.amount = BigInt(data.amount || 0);
    this.is_complete_withdrawl = data.is_complete_withdrawl || false;
  }
}

export const InterestWithdrawItnSchema = borsh.struct([
  borsh.u64("amount"),
  borsh.bool("is_complete_withdrawl"),
]);
