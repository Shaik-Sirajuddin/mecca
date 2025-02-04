import { Connection, PublicKey } from "@solana/web3.js";
import Decimal from "decimal.js";

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




