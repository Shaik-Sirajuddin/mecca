import { getAccount, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { usdtTokenMint, usdtTokenProgamId } from "./constants";
import { Connection, PublicKey } from "@solana/web3.js";
import { Decimal } from "decimal.js";
export const getUserUSDTAta = (user: PublicKey) => {
  return getAssociatedTokenAddressSync(
    usdtTokenMint,
    user,
    true,
    usdtTokenProgamId
  );
};

export const getUserUSDTBalance = async (
  connection: Connection,
  ata: PublicKey
) => {
  const account = await getAccount(
    connection,
    ata,
    "finalized",
    usdtTokenProgamId
  );
  return new Decimal(account.amount.toString());
};
