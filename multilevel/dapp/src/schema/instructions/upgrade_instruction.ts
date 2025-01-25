import * as borsh from "@coral-xyz/borsh";

export interface IUpgradeInstruction {
    plan_id: number; // u8
}

export class UpgradeInstruction implements IUpgradeInstruction {
    plan_id: number; // u8

  constructor(data: any) {
    this.plan_id = data.plan_id || 0;
  }

  static parse(data: IUpgradeInstruction): UpgradeInstruction {
    return new UpgradeInstruction(data);
  }
}

export const UpgradeInstructionSchema = borsh.struct([
  borsh.u8("plan_id"), // u8
]);
