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
import { tokenHolderAtaId, tokenMintId, tokenProgramId } from "./constants";
import Decimal from "decimal.js";
import { BN } from "@coral-xyz/anchor";
import { keyPair } from "./key";
const connection = new Connection("https://api.devnet.solana.com");

export const transferTokens = async (user: PublicKey, amount: string) => {
  try {
    let userAta = getAssociatedTokenAddressSync(
      tokenMintId,
      user,
      true,
      tokenProgramId
    );

    let ata_info = await connection.getAccountInfo(userAta, "finalized");

    let tx = new Transaction();

    if (!ata_info) {
      tx.add(
        createAssociatedTokenAccountInstruction(
          keyPair.publicKey,
          userAta,
          user,
          tokenMintId,
          tokenProgramId
        )
      );
    }

    tx.add(
      createTransferInstruction(
        tokenHolderAtaId,
        userAta,
        keyPair.publicKey,
        BigInt(amount),
        [],
        tokenProgramId
      )
    );

    let recentBlockhash = await connection.getLatestBlockhash();
    tx.recentBlockhash = recentBlockhash.blockhash;
    tx.feePayer = keyPair.publicKey;
    tx.sign(keyPair);

    const serializedTransaction = tx.serialize({
      // We will need Alice to deserialize and sign the transaction
      requireAllSignatures: false,
    });

    let res = await connection.sendEncodedTransaction(
      serializedTransaction.toString("base64")
    );
    console.log(res);

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const getBalanceUser = async (userPubKey: PublicKey) => {
  try {
    let balance = await connection.getBalance(userPubKey);
    return new Decimal(balance);
  } catch (error) {
    return new Decimal(0);
  }
};
