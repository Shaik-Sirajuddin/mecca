import {
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { appStateId, multilevelProgramId, tokenMint } from "./constants";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { AppState, AppStateSchema } from "../../../schema/multilevel/app_state";
import { UpdateStateInstruction } from "../../../schema/multilevel/instructions/update_state";

export const getUserTokenAta = (user: PublicKey) => {
  return getAssociatedTokenAddressSync(
    tokenMint,
    user,
    true,
    TOKEN_2022_PROGRAM_ID
  );
};

export const fetchAppState = async (connection: Connection) => {
  const appStateInfo = await connection.getAccountInfo(appStateId);
  return new AppState(AppStateSchema.decode(appStateInfo?.data));
};

export const getUpdateOwnerTransaction = async (
  user: PublicKey,
  new_owner: PublicKey
) => {
  const tx = new Transaction();
  tx.add(
    new TransactionInstruction({
      keys: [
        {
          pubkey: user,
          isSigner: true,
          isWritable: true,
        },
        {
          pubkey: new_owner,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: appStateId,
          isSigner: false,
          isWritable: true,
        },
      ],
      programId: multilevelProgramId,
      data: Buffer.from(new Uint8Array([6])),
    })
  );
  return tx;
};

export const getUpdateStateInstruction = async (
  user: PublicKey,
  paused: boolean
) => {
  const tx = new Transaction();

  let instruction_buffer = Buffer.alloc(100);

  UpdateStateInstruction.encode(
    {
      paused: paused,
    },
    instruction_buffer
  );

  instruction_buffer = instruction_buffer.subarray(
    0,
    UpdateStateInstruction.getSpan(instruction_buffer)
  );

  tx.add(
    new TransactionInstruction({
      keys: [
        {
          pubkey: user,
          isSigner: true,
          isWritable: true,
        },
        {
          pubkey: appStateId,
          isSigner: false,
          isWritable: true,
        },
      ],
      programId: multilevelProgramId,
      data: Buffer.concat([new Uint8Array([5]), instruction_buffer]),
    })
  );

  return tx;
};
