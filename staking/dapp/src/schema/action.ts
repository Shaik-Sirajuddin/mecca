import * as borsh from "@coral-xyz/borsh";

export interface IAction {
  action: number; // u8 (enum)
  time: bigint; // u64
  amount: bigint; // u64
}

export class Action implements IAction {
  action: number; // u8
  time: bigint; // u64
  amount: bigint; // u64

  constructor(data: any) {
    this.action = data.action || 0;
    this.time = BigInt(data.time || 0);
    this.amount = BigInt(data.amount || 0);
  }

  static parse(data: IAction): Action {
    return new Action(data);
  }
}

export const ActionSchema = borsh.struct([
  borsh.u8("action"), // Enum as u8
  borsh.u64("time"),
  borsh.u64("amount"),
]);
