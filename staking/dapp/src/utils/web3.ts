import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import {
  appStateId,
  appTokenStoreAtaId,
  appTokenStoreOwnerId,
  stakeProgramId,
  tokenMint,
  tokenProgramId,
} from "./constants";
import { InstructionID } from "../interface/InstructionId";
import { AppStateSchema } from "../schema/app_state_schema";

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

export const getAppState = async (connection: Connection) => {
  const accountInfo = await connection.getAccountInfo(
    new PublicKey(appStateId)
  );
  if (!accountInfo || !accountInfo?.data) {
    console.log("no account info");
    return;
  }
  const deserializedData = AppStateSchema.decode(accountInfo?.data);
  return deserializedData;
};

export const getClaimInstruction = (user: PublicKey) => {
  const claim_instruction = new TransactionInstruction({
    programId: new PublicKey(stakeProgramId),
    keys: [
      {
        //user account
        pubkey: user!,
        isWritable: true,
        isSigner: true,
      },
      {
        //user data account (pda)
        pubkey: deriveUserPDA(user!),
        isWritable: true,
        isSigner: false,
      },
      {
        //app state
        pubkey: appStateId,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: getATA(user),
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: appTokenStoreAtaId,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: appTokenStoreOwnerId,
        isWritable: false,
        isSigner: false,
      },
      {
        pubkey: tokenMint,
        isWritable: false,
        isSigner: false,
      },
      {
        pubkey: tokenProgramId,
        isWritable: false,
        isSigner: false,
      },
      {
        //system program
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    data: Buffer.from(new Uint8Array([InstructionID.WITHDRAW])),
  });
  return claim_instruction;
};
