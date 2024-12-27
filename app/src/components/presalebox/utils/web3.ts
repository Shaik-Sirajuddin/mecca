import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import {
  saleTokenHoldingAta,
  saleTokenMint,
  saleTokenProgramId,
  usdtTokenMint,
  usdtTokenProgamId,
} from "./constants";
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

export const getUserTokenAta = (user: PublicKey) => {
  return getAssociatedTokenAddressSync(
    saleTokenMint,
    user,
    true,
    saleTokenProgramId
  );
};

export const getSPlTokenBalance = async (
  connection: Connection,
  ata: PublicKey
) => {
  try {
    const balance = await connection.getTokenAccountBalance(ata, "processed");
    return new Decimal(balance.value.amount);
  } catch (error) {
    console.log(error);
    return new Decimal(0);
  }
};

export const getTokensInSale = async (connection: Connection) => {
  const balance = await connection.getTokenAccountBalance(
    saleTokenHoldingAta,
    "finalized"
  );
  return new Decimal(balance.value.amount);
};
