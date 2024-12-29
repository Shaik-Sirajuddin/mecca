import { getAccount, TokenAccountNotFoundError } from "@solana/spl-token";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { deriveUserPDA, getATA } from "../../utils/web3";
import { tokenProgramId } from "../../utils/constants";
import {
  setTokenBalance,
  setUserAtaExists,
  setUserData,
  setUserPdaExists,
} from "./userSlice";
import { Dispatch } from "@reduxjs/toolkit";
import { UserSchema } from "../../schema/user";

const handler = async (
  connection: Connection,
  publicKey: PublicKey | null,
  dispatch: Dispatch
) => {
  try {
    if (!publicKey) return;
    const userAta = await getAccount(
      connection,
      getATA(publicKey),
      "finalized",
      tokenProgramId
    );

    dispatch(setTokenBalance(userAta.amount.toString()));
    dispatch(setUserAtaExists(true));

    const userDataPDA = await connection.getAccountInfo(
      deriveUserPDA(publicKey)
    );

    if (userDataPDA == null || userDataPDA.owner == SystemProgram.programId) {
      console.log("user account doesnt exist");
      dispatch(setUserPdaExists(false));
      return;
    }

    dispatch(setUserPdaExists(true));
    console.log(UserSchema);
    //deserialize user data
    const userData = UserSchema.decode(userDataPDA.data);
    // const userData = deserialize(UserSchema, userDataPDA.data);
    console.log("user ata", userAta);
    dispatch(setUserData(userData));
  } catch (error: unknown) {
    console.log(error);
    if (error instanceof TokenAccountNotFoundError) {
      //pda doesn't exist if token account does't exist
      dispatch(setUserPdaExists(false));
      dispatch(setUserAtaExists(false));
      dispatch(setTokenBalance("0"));
      return;
    }
  }
};

export default handler;
