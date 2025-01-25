import * as borsh from "@coral-xyz/borsh";
import { PublicKey } from "@solana/web3.js";

export interface IJoinInstruction {
  plan_id: number; // u8
  referrer: PublicKey; // Pubkey
  user_id: string; // String
}

export class JoinInstruction implements IJoinInstruction {
  plan_id: number; // u8
  referrer: PublicKey; // Pubkey
  user_id: string; // String

  constructor(data: any) {
    this.plan_id = data.plan_id || 0;
    this.referrer = new PublicKey(data.referrer || PublicKey.default);
    this.user_id = data.user_id || "";
  }

  static parse(data: IJoinInstruction): JoinInstruction {
    return new JoinInstruction(data);
  }
}

export const JoinInstructionSchema = borsh.struct([
  borsh.u8("plan_id"), // u8
  borsh.publicKey("referrer"), // PublicKey
  borsh.str("user_id"), // String
]);
