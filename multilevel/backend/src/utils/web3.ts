import { Connection, PublicKey } from "@solana/web3.js";
import { multilevelProgramId, rpcUrl } from "../constants";

export const getUserDataAcc = (address: PublicKey) => {
  let [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user-data-"), address.toBuffer()],
    multilevelProgramId
  );
  return pda;
};

export const connection = new Connection(rpcUrl);
