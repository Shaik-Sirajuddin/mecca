import "./App.css";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  fetchAppState,
  fetchUserData,
  getJoinTransaction,
  getUpgradeTransaction,
  getUserDataAcc,
  getWithdrawTransaction,
} from "./utils/web3";
import { PlanID } from "./enums/plan";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { SendTransactionError } from "@solana/web3.js";
import { UserData } from "./schema/user_data";
import { useState } from "react";
import { AppState } from "./schema/app_state";
import Decimal from "decimal.js";

function App() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [userData, setUserData] = useState<UserData>(UserData.dummy());
  const [appState, setAppState] = useState<AppState>(AppState.dummy());

  const enroll = async () => {
    try {
      if (!publicKey) return;
      const tx = getJoinTransaction(
        publicKey,
        publicKey,
        PlanID.A,
        "MC00000001"
      );

      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      const signedTx = await signTransaction!(tx);
      const broadcastResponse = await connection.sendRawTransaction(
        signedTx.serialize()
      );
      console.log(broadcastResponse);
    } catch (error) {
      if (error instanceof SendTransactionError) {
        console.log(await error.getLogs(connection));
      }
      console.log(error);
    }
  };

  const upgrade = async () => {
    try {
      if (!publicKey) return;
      const tx = getUpgradeTransaction(publicKey, PlanID.B);

      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      const signedTx = await signTransaction!(tx);
      const broadcastResponse = await connection.sendRawTransaction(
        signedTx.serialize()
      );
      console.log(broadcastResponse);
    } catch (error) {
      if (error instanceof SendTransactionError) {
        console.log(await error.getLogs(connection));
      }
      console.log(error);
    }
  };

  const withdraw = async () => {
    if (!publicKey) return;
    const tx = getWithdrawTransaction(publicKey, new Decimal(1000000));

    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = publicKey;

    const signedTx = await signTransaction!(tx);
    const broadcastResponse = await connection.sendRawTransaction(
      signedTx.serialize()
    );
    console.log(broadcastResponse);
  };
  const fetchUser = async () => {
    if (!publicKey) return;
    const userDataAcc = getUserDataAcc(publicKey);
    const userData = await fetchUserData(userDataAcc, connection);  
    setUserData(userData);
    const appState = await fetchAppState(connection);
    setAppState(appState);
  };

  const logUserData = async () => {
    console.log(userData.availableForWithdraw(appState).toString());
    console.log(userData.enrolled_at.toString());
    console.log(userData.acc_fee.toString());
    console.log(userData.acc_daily_reward.toString());
    console.log(userData.accumulated.daily_reward.toString())
  };
  return (
    <>
      <WalletMultiButton />
      <button onClick={fetchUser}>Enroll Plan A</button>
      <button onClick={logUserData}>Log user data</button>
      <button onClick={withdraw}>Withdraw</button>
      <button onClick={upgrade}>Upgrade</button>
    </>
  );
}

export default App;
