import * as borsh from "@coral-xyz/borsh";
import { PublicKey } from "@solana/web3.js";
export interface IUpdateConfigInstruction {
  paused: boolean;
  start_time: number;
  deposit_acc: PublicKey;
}
export const UpdateConfigInstruction = borsh.struct([
  borsh.bool("paused"),
  borsh.u64("start_time"),
  borsh.publicKey("deposit_acc"),
]);
