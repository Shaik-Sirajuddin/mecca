import {
  AccountMeta,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { appStateId, multilevelProgramId, rpcUrl } from "../constants";
import { secretKey } from "../key";
import { UserData } from "../schema/user_data";
import { UserStore } from "../schema/user_store";
import { AppState, AppStateSchema } from "../schema/app_state";

const wallet = Keypair.fromSecretKey(secretKey);

export const fetchUserDataFromNode = async (user: PublicKey) => {
  let userDataAcc = getUserDataAcc(user);
  let accountInfo = await connection.getAccountInfo(userDataAcc, "processed");
  return new UserData(UserData.schema.decode(accountInfo?.data));
};
export const fetchUserStoreFromNode = async (user: PublicKey) => {
  let userStoreAcc = getUserStoreAcc(user);
  let accountInfo = await connection.getAccountInfo(userStoreAcc, "processed");
  return new UserStore(UserStore.schema.decode(accountInfo?.data));
};
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

export const sendDistributeTransaction = async (accountList : AccountMeta[][])=> {
  try {

    let tx = new Transaction();
    for(let i = 0;i<accountList.length;i++){
      let instruction = new TransactionInstruction({
        keys: accountList[i],
        programId: multilevelProgramId,
        data: Buffer.from(new Uint8Array([4])),
      });
      tx.add(instruction);
    }
    return await sendAndConfirmTransaction(connection, tx, [wallet]);
  } catch (error) {
    console.log(error);
    console.log(JSON.stringify(error, null, 2));
  }
};

export const fetchAppState = async (connection: Connection) => {
  const appStateInfo = await connection.getAccountInfo(appStateId);
  return new AppState(AppStateSchema.decode(appStateInfo?.data));
};
export const connection = new Connection(rpcUrl);
