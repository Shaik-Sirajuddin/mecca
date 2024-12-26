import {
  getAccount,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  getOrCreateAssociatedTokenAccount,
  getAccountLen,
} from "@solana/spl-token";
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
  saleTokenMint,
  tokenProgramId,
  usdtDepositAtaId,
  usdtTokenProgramId,
} from "./constants";
import Decimal from "decimal.js";
import { BN } from "@coral-xyz/anchor";
import { example, keyPair } from "./key";
import { PurchaseInstructionSchema } from "./schema/purchase_instruction";
const connection = new Connection("http://localhost:8899");

export const getTokensAvailableForSale = async (): Promise<Decimal> => {
  const balance = await connection.getTokenAccountBalance(
    saleTokenHolderAtaId,
    "finalized"
  );
  return new Decimal(balance.value.amount);
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
  console.log(
    amount,
    is_usdt,
    token_amount,
    userPubKey,
    userUsdtAta,
    userTokenAta
  );
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
        usdtTokenProgramId
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

  let ata_info = await connection.getAccountInfo(userTokenAta, "finalized");
  if (!ata_info) {
    tx.add(
      createAssociatedTokenAccountInstruction(
        userPubKey,
        userTokenAta,
        userPubKey,
        saleTokenMint,
        tokenProgramId
      )
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

  let recentBlockhash = await connection.getLatestBlockhash();
  tx.recentBlockhash = recentBlockhash.blockhash;
  tx.feePayer = userPubKey;
  tx.partialSign(keyPair);

  const serializedTransaction = tx.serialize({
    // We will need Alice to deserialize and sign the transaction
    requireAllSignatures: false,
  });
  // let res = await connection.sendEncodedTransaction(
  //   serializedTransaction.toString("base64")
  // );
  // console.log(res);
  return serializedTransaction.toString("base64");
};
// let _ata = getAssociatedTokenAddressSync(
//   new PublicKey("CWiA6Zq6jFsB4XP7AKxgyeqw3r24NbDDsL56ctCjdDuD"),
//   new PublicKey("HJAh6Hf5VUZtcGXer3obgxQFfs1QNVD542t8FZrmVjaJ"),
//   true,
//   tokenProgramId
// );
// console.log(_ata.toString());
// generatePurchaseTransactionSigned(
//   "10",
//   false,
//   "100",
//   new PublicKey("HJAh6Hf5VUZtcGXer3obgxQFfs1QNVD542t8FZrmVjaJ"),
//   null,
//   new PublicKey(
//     getAssociatedTokenAddressSync(
//       new PublicKey("CWiA6Zq6jFsB4XP7AKxgyeqw3r24NbDDsL56ctCjdDuD"),
//       new PublicKey("HJAh6Hf5VUZtcGXer3obgxQFfs1QNVD542t8FZrmVjaJ"),
//       true,
//       tokenProgramId
//     )
//   )
// ).then((res) => {
//   console.log(res);
// });
