import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";
import {
  appStateId,
  appTokenStoreAtaId,
  appTokenStoreOwnerId,
  stakeProgramId,
  tokenMint,
  tokenProgramId,
} from "./constants";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { Config, ConfigSchema } from "../../../schema/staking/config";
import { WithdrawTokensInstruction } from "../../../schema/ico/instructions/WithdrawInstruction";

export const getUserTokenAta = (user: PublicKey) => {
  return getAssociatedTokenAddressSync(tokenMint, user, true, tokenProgramId);
};

export const getUpdateConfigInstruction = (user: PublicKey, config: Config) => {
  const tx = new Transaction();

  let instruction_data = Buffer.alloc(400);

  ConfigSchema.encode(
    {
      lock_time_principal: new BN(config.lock_time_principal.toString()),
      lock_time_interest: new BN(config.lock_time_interest.toString()),
      min_deposit_user: new BN(config.min_deposit_user.toString()),
      max_deposit_user: new BN(config.max_deposit_user.toString()),
    },
    instruction_data
  );
  instruction_data = instruction_data.subarray(
    0,
    ConfigSchema.getSpan(instruction_data)
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
      programId: stakeProgramId,
      data: Buffer.concat([new Uint8Array([6]), instruction_data]),
    })
  );

  return tx;
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
      programId: stakeProgramId,
      data: Buffer.from(new Uint8Array([7])),
    })
  );
  return tx;
};

export const getWithdrawTokensTransaction = async (
  user: PublicKey,
  connection: Connection,
  amount: string
) => {
  const tx = new Transaction();

  let instruction_buffer = Buffer.alloc(400);

  WithdrawTokensInstruction.encode(
    { amount: new BN(amount) },
    instruction_buffer
  );

  instruction_buffer = instruction_buffer.subarray(
    0,
    WithdrawTokensInstruction.getSpan(instruction_buffer)
  );

  const userAta = getUserTokenAta(user);

  const accountInfo = connection.getAccountInfo(userAta);

  if (!accountInfo) {
    tx.add(
      createAssociatedTokenAccountInstruction(
        user,
        userAta,
        user,
        tokenMint,
        tokenProgramId
      )
    );
  }

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
        {
          pubkey: appTokenStoreAtaId,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: appTokenStoreOwnerId,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: userAta,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: tokenMint,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: tokenProgramId,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: stakeProgramId,
      data: Buffer.concat([new Uint8Array([8]), instruction_buffer]),
    })
  );
  return tx;
};

export const parsePubKey = (address: string) => {
  try {
    return new PublicKey(address);
  } catch (error) {
    return null;
  }
};
