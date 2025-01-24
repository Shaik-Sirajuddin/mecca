import * as borsh from "@coral-xyz/borsh";
import Decimal from "decimal.js";

export interface IWithdrawInstruction {
  amount: Decimal; // u8
}

export class WithdrawInstruction implements IWithdrawInstruction {
  amount: Decimal; // u8

  constructor(data: any) {
    this.amount = new Decimal((data.amount || 0).toString());
  }

  static parse(data: IWithdrawInstruction): WithdrawInstruction {
    return new WithdrawInstruction(data);
  }
}

export const WithdrawInstructionSchema = borsh.struct([
  borsh.u64("amount"), // u8
]);
