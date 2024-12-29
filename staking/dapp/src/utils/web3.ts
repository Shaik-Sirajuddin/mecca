import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { stakeProgramId, tokenMint, tokenProgramId } from "./constants";

export const deriveUserPDA = (user: PublicKey) => {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user-data-"), user.toBytes()],
    new PublicKey(stakeProgramId)
  );
  return pda;
};

export const getATA = (owner: PublicKey) => {
  return getAssociatedTokenAddressSync(
    new PublicKey(tokenMint),
    owner,
    true,
    new PublicKey(tokenProgramId) //program 2022
  );
};
