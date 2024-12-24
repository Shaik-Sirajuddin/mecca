import { getAccount, createTransferInstruction } from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  appStateId,
  icoProgramId,
  saleTokenHolderAtaId,
  tokenProgramId,
  usdtDepositAtaId,
} from "./constants";
import Decimal from "decimal.js";
import { BN } from "@coral-xyz/anchor";
import { keyPair } from "./key";
import { PurchaseInstructionSchema } from "./schema/purchase_instruction";
const conection = new Connection("http://localhost:8899");

export const getTokensAvailableForSale = async (): Promise<Decimal> => {
  let account = await getAccount(conection, saleTokenHolderAtaId);
  return new Decimal(account.amount.toString());
};

const getPurchaseInstructionForState = async (
  amount: string,
  is_usdt: boolean,
  token_amount: String,
  userPubKey: PublicKey
) => {
  let instruction_data = Buffer.alloc(200);

  PurchaseInstructionSchema.encode(
    {
      token_amount: new BN(token_amount),
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

  const update_state_instruction = new TransactionInstruction({
    programId: icoProgramId,
    keys: [
      {
        pubkey: userPubKey,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: keyPair.publicKey,
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: appStateId,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    data: Buffer.concat([instructionIdBuffer, instruction_data]),
  });

  return update_state_instruction;
};

/**
 * @returns base64 encoded transaction buffer
 */
export const generatePurchaseTransactionSigned = async (
  //amount should be without decimals ( 1000 or 1000)
  amount: string,
  is_usdt: boolean,
  token_amount: string,
  userPubKey: PublicKey,
  userUsdtAta: PublicKey | null,
  userTokenAta: PublicKey
) => {
  let tx = new Transaction();

  if (is_usdt) {
    // usdt transfer from user to owner
    tx.add(
      createTransferInstruction(
        userUsdtAta!,
        usdtDepositAtaId,
        userPubKey,
        BigInt(amount),
        [],
        tokenProgramId
      )
    );
  } else {
    //sol transfer from user to owner
    tx.add(
      SystemProgram.transfer({
        fromPubkey: userPubKey,
        toPubkey: keyPair.publicKey,
        lamports: BigInt(amount),
      })
    );
  }

  //transfer tokens to user
  tx.add(
    createTransferInstruction(
      saleTokenHolderAtaId!,
      userTokenAta,
      keyPair.publicKey,
      BigInt(token_amount),
      [],
      tokenProgramId
    )
  );

  //state change instruction for tracking
  tx.add(
    await getPurchaseInstructionForState(
      amount,
      is_usdt,
      token_amount,
      userPubKey
    )
  );

  let recentBlockhash = await conection.getLatestBlockhash();
  tx.recentBlockhash = recentBlockhash.blockhash;
  tx.feePayer = userPubKey;
  tx.partialSign(keyPair);

  const serializedTransaction = tx.serialize({
    // We will need Alice to deserialize and sign the transaction
    requireAllSignatures: false,
  });
  return serializedTransaction.toString("base64");
};
