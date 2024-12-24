import * as borsh from "@coral-xyz/borsh";

export const PurchaseInstructionSchema = borsh.struct([
  borsh.u64("token_amount"),
  borsh.u64("paid_amount"),
  borsh.bool("is_usdt"),
]);
