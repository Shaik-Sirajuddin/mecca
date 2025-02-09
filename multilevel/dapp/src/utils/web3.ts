import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import {
  appStateAcc,
  appStoreAcc,
  multilevelProgramId,
  tokenHolderATA,
  tokenHolderOwner,
  tokenMint,
} from "./constants";
import { InstructionID } from "../enums/instruction";
import {
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  getAccount,
} from "@solana/spl-token";
import { JoinInstructionSchema } from "../schema/instructions/join_instruction";
import { PlanID } from "../enums/plan";
import { UserData } from "../schema/user_data";
import { AppState, AppStateSchema } from "../schema/app_state";
import { WithdrawInstructionSchema } from "../schema/instructions/withdraw_instruction";
import Decimal from "decimal.js";
import { UpgradeInstructionSchema } from "../schema/instructions/upgrade_instruction";
import { AppStore, AppStoreSchema } from "../schema/app_store";

export const isValidPublicKey = (value: string) => {
  try {
    new PublicKey(value);
    return true;
  } catch {
    return false;
  }
};
export const fetchUserData = async (
  dataAcc: PublicKey,
  connection: Connection
) => {
  try {
    const userDataAccInfo = await connection.getAccountInfo(dataAcc);
    return new UserData(UserData.schema.decode(userDataAccInfo?.data));
  } catch (error: any) {
    console.log("Fetch user data error : ", error);
    return null;
  }
};

export const fetchAppState = async (connection: Connection) => {
  const appStateInfo = await connection.getAccountInfo(appStateAcc);
  return new AppState(AppStateSchema.decode(appStateInfo?.data));
};
export const fetchAppStore = async (connection: Connection) => {
  const appStoreInfo = await connection.getAccountInfo(appStoreAcc);
  return new AppStore(AppStoreSchema.decode(appStoreInfo?.data));
};

export const getUserDataAcc = (user: PublicKey) => {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user-data-"), user.toBuffer()],
    multilevelProgramId
  );
  return pda;
};

export const getUserStoreAcc = (user: PublicKey) => {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user-store-"), user.toBuffer()],
    multilevelProgramId
  );
  return pda;
};

export const getATA = (user: PublicKey) => {
  return getAssociatedTokenAddressSync(
    tokenMint,
    user,
    true,
    TOKEN_2022_PROGRAM_ID
  );
};

export const getTokenBalance = async (
  connection: Connection,
  userAta: PublicKey
) => {
  try {
    const account = await getAccount(
      connection,
      userAta,
      "confirmed",
      TOKEN_2022_PROGRAM_ID
    );

    return new Decimal(account.amount.toString());
  } catch (error: any) {
    console.log("Fetch token balance", error);
    return null;
  }
};
export const getJoinTransaction = (
  user: PublicKey,
  referrer: PublicKey,
  plan: PlanID,
  user_id: string
) => {
  let instruction_data = Buffer.alloc(100);

  JoinInstructionSchema.encode(
    { plan_id: plan.toFixed(0), referrer, user_id: user_id },
    instruction_data
  );
  instruction_data = instruction_data.subarray(
    0,
    JoinInstructionSchema.getSpan(instruction_data)
  );

  const instruction = new TransactionInstruction({
    keys: [
      {
        pubkey: user,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: appStateAcc,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: getUserDataAcc(user),
        isSigner: false,
        isWritable: true,
      },
      
      {
        pubkey: getUserDataAcc(referrer),
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: tokenMint,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: getATA(user),
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: tokenHolderATA,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: tokenHolderOwner,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: TOKEN_2022_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    programId: new PublicKey(multilevelProgramId),
    data: Buffer.concat([
      Buffer.from(new Uint8Array([InstructionID.Join])),
      instruction_data,
    ]),
  });

  const tx = new Transaction();
  tx.add(instruction);
  return tx;
};

export const getWithdrawTransaction = (user: PublicKey, amount: Decimal) => {
  let instruction_data = Buffer.alloc(100);

  console.log("this", amount.toString());
  WithdrawInstructionSchema.encode(
    { amount: new BN(amount.toString()) },
    instruction_data
  );
  instruction_data = instruction_data.subarray(
    0,
    WithdrawInstructionSchema.getSpan(instruction_data)
  );

  const instruction = new TransactionInstruction({
    keys: [
      {
        pubkey: user,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: appStateAcc,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: getUserDataAcc(user),
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: tokenMint,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: getATA(user),
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: tokenHolderATA,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: tokenHolderOwner,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: TOKEN_2022_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    programId: new PublicKey(multilevelProgramId),
    data: Buffer.concat([
      Buffer.from(new Uint8Array([InstructionID.Withdraw])),
      instruction_data,
    ]),
  });

  const tx = new Transaction();
  tx.add(instruction);
  return tx;
};

export const getUpgradeTransaction = (user: PublicKey, plan: PlanID) => {
  let instruction_data = Buffer.alloc(100);

  UpgradeInstructionSchema.encode(
    { plan_id: plan.toFixed(0) },
    instruction_data
  );
  instruction_data = instruction_data.subarray(
    0,
    UpgradeInstructionSchema.getSpan(instruction_data)
  );

  const instruction = new TransactionInstruction({
    keys: [
      {
        pubkey: user,
        isSigner: true,
        isWritable: true,
      },

      {
        pubkey: getUserDataAcc(user),
        isSigner: false,
        isWritable: true,
      },
    
      {
        pubkey: appStateAcc,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: tokenMint,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: getATA(user),
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: tokenHolderATA,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: tokenHolderOwner,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: TOKEN_2022_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    programId: new PublicKey(multilevelProgramId),
    data: Buffer.concat([
      Buffer.from(new Uint8Array([InstructionID.Upgrade])),
      instruction_data,
    ]),
  });

  const tx = new Transaction();
  tx.add(instruction);
  return tx;
};
