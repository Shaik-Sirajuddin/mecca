import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";
import {
  appConfigPDA,
  icoProgramId,
  priceFeedId,
  priceFeedProgramId,
  saleDataPDA,
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
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { Decimal } from "decimal.js";
import { PurchaseInstructionSchema } from "../../../schema/ico/instructions/PurchaseInstruction";
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

export const getPurchaseTx = async (
  user: PublicKey,
  deposit_acc: PublicKey,
  amount: string,
  is_usdt: boolean,
  connection: Connection
) => {
  const tx = new Transaction();

  const userTokenAta = getUserTokenAta(user);
  const userUSDTAta = getUserUSDTAta(user);

  const accountInfo = await connection.getAccountInfo(userTokenAta);

  if (!accountInfo) {
    tx.add(
      createAssociatedTokenAccountInstruction(
        user,
        userTokenAta,
        user,
        saleTokenMint,
        saleTokenProgramId
      )
    );
  }
  let instruction_data = Buffer.alloc(200);

  PurchaseInstructionSchema.encode(
    {
      paid_amount: new BN(amount),
      is_usdt: is_usdt,
    },
    instruction_data
  );
  instruction_data = instruction_data.subarray(
    0,
    PurchaseInstructionSchema.getSpan(instruction_data)
  );

  const instructionIdBuffer = new Uint8Array([1]);
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
          pubkey: saleDataPDA,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: userUSDTAta,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: userTokenAta,
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
          pubkey: usdtTokenMint,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: saleTokenMint,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: priceFeedId,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: getUserUSDTAta(deposit_acc),
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: deposit_acc,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: usdtTokenProgamId,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: saleTokenProgramId,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: priceFeedProgramId,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: icoProgramId,
      data: Buffer.concat([instructionIdBuffer, instruction_data]),
    })
  );
  return tx;
};
