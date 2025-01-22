import {
  AccountMeta,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmRawTransaction,
  sendAndConfirmTransaction,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { multilevelProgramId, rpcUrl } from "../constants";
import { secretKey } from "../key";

const wallet = Keypair.fromSecretKey(secretKey);
export const getUserDataAcc = (address: PublicKey) => {
  let [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user-data-"), address.toBuffer()],
    multilevelProgramId
  );
  return pda;
};

export const getUserStoreAcc = (address: PublicKey) => {
  let [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user-store-"), address.toBuffer()],
    multilevelProgramId
  );
  return pda;
};

export const sendDistributeTransaction = async (accounts: AccountMeta[]) => {
  try {
    let instruction = new TransactionInstruction({
      keys: accounts,
      programId: multilevelProgramId,
      data: Buffer.from(new Uint8Array([4])),
    });
    let tx = new Transaction();
    tx.add(instruction);
    await sendAndConfirmTransaction(connection, tx, [wallet]);
  } catch (error) {
    console.log(error);
  }
};

export const connection = new Connection(rpcUrl);
