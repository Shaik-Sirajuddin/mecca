import * as borsh from "@coral-xyz/borsh";

export interface IAmountInstruction {
  amount: bigint; // u64
}

export class AmountInstruction implements IAmountInstruction {
  amount: bigint; // u64

  constructor(data: any) {
    this.amount = BigInt(data.amount || 0);
  }
}

export const AmountInstructionSchema = borsh.struct([borsh.u64("amount")]);
