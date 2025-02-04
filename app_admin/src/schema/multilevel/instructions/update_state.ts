import * as borsh from "@coral-xyz/borsh";
export const UpdateStateInstruction = borsh.struct([borsh.bool("paused")]);
