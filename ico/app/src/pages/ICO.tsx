import React, { useEffect, useState } from "react";
import "./ICO.css";
import { Connection, PublicKey } from "@solana/web3.js";
import { IcoState } from "../schema/IcoState";
import { fetchIcoState } from "../network/api";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { icoStatePDAId } from "../utils/constants";
import { ContractState, ContractStateSchema } from "../schema/ContractState";
import Decimal from "decimal.js";
import { getUserUSDTAta, getUserUSDTBalance } from "../utils/web3";

const ICO: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [usdtAta, setUsdtAta] = useState<PublicKey | null>(null);

  //amount in decimal represented as string '10.232'
  const [solAmount, setSolAmount] = useState("");
  const [usdtAmount, setUsdtAmount] = useState("");

  const [usdtBalance, setUsdtBalance] = useState(new Decimal(0));

  const [icoState, setIcoState] = useState(IcoState.dummy());
  const [contractState, setContractState] = useState(ContractState.dummy());

  const syncInitialState = async () => {
    const _state = await fetchIcoState();
    if (_state) {
      setIcoState(new IcoState(_state));
    }
    fetchContractState();
  };

  const fetchContractState = async () => {
    try {
      const accountInfo = await connection.getAccountInfo(
        icoStatePDAId,
        "finalized"
      );
      const deserializedData = ContractStateSchema.decode(accountInfo?.data);
      setContractState(new ContractState(deserializedData));
    } catch (error) {
      //TODO : show toast
      console.log(error);
    }
  };

  const syncUserUSDTInfo = async () => {
    try {
      if (!publicKey) {
        setUsdtBalance(new Decimal(0));
        setUsdtAta(null);
        return;
      }
      const _ata = getUserUSDTAta(publicKey);
      const _balance = await getUserUSDTBalance(connection, _ata);
      setUsdtAta(_ata);
      setUsdtBalance(new Decimal(_balance));
      console.log(_balance.toString())
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    console.log("contract state ", contractState);
  }, [contractState]);

  useEffect(() => {
    syncInitialState();
  }, []);

  useEffect(() => {
    syncUserUSDTInfo();
  }, [publicKey]);
  return (
    <>
      <button>Purchase with sol</button>
      <button>Purchase With usdt</button>
    </>
  );
};

export default ICO;
