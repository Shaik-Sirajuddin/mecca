import {
  Connection,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { appStateId, icoProgramId } from "../constants";
import { keyPair } from "../key";
export async function init_app_state(connection: Connection) {
  let tx = new Transaction();

  const buffer = Buffer.from(new Uint8Array([0]));

  tx.add(
    new TransactionInstruction({
      programId: icoProgramId,
      keys: [
        {
          pubkey: keyPair.publicKey,
          isSigner: true,
          isWritable: true,
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
      data: buffer,
    })
  );

  let res = await sendAndConfirmTransaction(connection, tx, [keyPair]);
  return res;
}
