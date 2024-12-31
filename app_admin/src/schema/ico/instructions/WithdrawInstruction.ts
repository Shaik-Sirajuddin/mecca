import * as borsh from "@coral-xyz/borsh";
export const WithdrawTokensInstruction = borsh.struct([
  borsh.u64("amount"),
]);
