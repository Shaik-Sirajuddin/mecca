import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";
import {
  appConfigPDA,
  icoProgramId,
  saleTokenMint,
  saleTokenProgramId,
  tokenHoldingAta,
  tokenHoldingOwner,
  usdtTokenMint,
  usdtTokenProgamId,
} from "./constants";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { Decimal } from "decimal.js";
import { Round, RoundSchema } from "../../../schema/ico/Round";
import { AppConfig } from "../../../schema/ico/AppConfig";
import { UpdateConfigInstruction } from "../../../schema/ico/instructions/UpdateConigInstruction";
import { WithdrawTokensInstruction } from "../../../schema/ico/instructions/WithdrawInstruction";
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
    tokenHoldingAta,
    "finalized"
  );
  return new Decimal(balance.value.amount);
};

export const getUpdateRoundTransaction = async (
  user: PublicKey,
  round: Round
) => {
  const tx = new Transaction();

  let instruction_buffer = Buffer.alloc(400);
  const timeSeconds = parseInt(
    Math.floor(round.end_time.getTime() / 1000).toString()
  );
  const data = {
    idx: round.idx,
    round_price: new BN(round.round_price.toString()),
    price_decimals: round.price_decimals,
    end_time: new BN(timeSeconds),
  };
  RoundSchema.encode(data, instruction_buffer);

  instruction_buffer = instruction_buffer.subarray(
    0,
    RoundSchema.getSpan(instruction_buffer)
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
          pubkey: appConfigPDA,
          isSigner: false,
          isWritable: true,
        },
      ],
      programId: icoProgramId,
      data: Buffer.concat([new Uint8Array([4]), instruction_buffer]),
    })
  );
  return tx;
};

export const getUpdateConfigTransaction = async (
  user: PublicKey,
  appConfig: AppConfig
) => {
  const tx = new Transaction();

  let instruction_buffer = Buffer.alloc(400);
  const timeSeconds = parseInt(
    Math.floor(appConfig.start_time.getTime() / 1000).toString()
  );
  const data = {
    paused: appConfig.paused,
    start_time: new BN(timeSeconds),
    deposit_acc: new PublicKey(appConfig.deposit_acc),
  };
  UpdateConfigInstruction.encode(data, instruction_buffer);

  instruction_buffer = instruction_buffer.subarray(
    0,
    UpdateConfigInstruction.getSpan(instruction_buffer)
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
          pubkey: appConfigPDA,
          isSigner: false,
          isWritable: true,
        },
      ],
      programId: icoProgramId,
      data: Buffer.concat([new Uint8Array([3]), instruction_buffer]),
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
          pubkey: appConfigPDA,
          isSigner: false,
          isWritable: true,
        },
      ],
      programId: icoProgramId,
      data: Buffer.from(new Uint8Array([2])),
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
        saleTokenMint,
        saleTokenProgramId
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
          pubkey: appConfigPDA,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: tokenHoldingAta,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: tokenHoldingOwner,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: userAta,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: saleTokenMint,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: saleTokenProgramId,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: icoProgramId,
      data: Buffer.concat([new Uint8Array([5]), instruction_buffer]),
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
