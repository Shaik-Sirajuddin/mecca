import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  appStateAcc,
  appStoreAcc,
  multilevelProgramId,
  tokenHolderATA,
  tokenHolderOwner,
  tokenMint,
} from "./constants";
import { InstructionID } from "../enums/instruction";
import {
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

export const getUserDataAcc = (user: PublicKey) => {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user-data-"), user.toBuffer()],
    multilevelProgramId
  );
  return pda;
};

export const getUserStoreAcc = (user: PublicKey) => {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user-store-"), user.toBuffer()],
    multilevelProgramId
  );
  return pda;
};

export const getATA = (user: PublicKey) => {
  return getAssociatedTokenAddressSync(
    tokenMint,
    user,
    true,
    multilevelProgramId
  );
};
export const getEnrollTransaction = (user: PublicKey, referrer: PublicKey) => {
  const instruction = new TransactionInstruction({
    keys: [
      {
        pubkey: user,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: appStateAcc,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: appStoreAcc,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: getUserDataAcc(user),
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: getUserStoreAcc(user),
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: getUserDataAcc(referrer),
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: tokenMint,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: getATA(user),
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: tokenHolderATA,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: tokenHolderOwner,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: TOKEN_2022_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    programId: new PublicKey(multilevelProgramId),
    data: Buffer.from(new Uint8Array([InstructionID.Join])),
  });
};
