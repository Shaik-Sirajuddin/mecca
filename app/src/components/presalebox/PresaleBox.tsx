import { useCallback, useEffect, useRef, useState } from "react";
import {
  getPurchaseTx,
  getSPlTokenBalance,
  getTokensInSale,
  getUserTokenAta,
  getUserUSDTAta,
} from "./utils/web3";
import TokenProgress from "../presale-range-slider/PresaleRangeSlider";
import "./style.css";
import toast from "react-hot-toast";
import { PublicKey, SendTransactionError } from "@solana/web3.js";
import Decimal from "decimal.js";
import { appConfigPDA, token, usdt } from "./utils/constants";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  deci,
  formatBalance,
  presaleStates,
  updateIfValid,
} from "./utils/utils";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { AppConfig, AppConfigSchema } from "../../schema/ico/AppConfig";
import { Round } from "../../schema/ico/Round";

const PresaleBox = () => {
  const { connection } = useConnection();
  const { connected, publicKey, sendTransaction, signTransaction } =
    useWallet();
  const [, setUsdtAta] = useState<PublicKey | null>(null);
  const [tokenAta, setTokenAta] = useState<PublicKey | null>(null);

  //amount in decimal represented as string '10.232'
  const [solAmount, setSolAmount] = useState("0.01");
  const [usdtAmount, setUsdtAmount] = useState("0.01");
  const [receivableToken, setReceivableToken] = useState("100");

  const [tokenBalance, setTokenBalance] = useState(new Decimal(0));
  const [usdtBalance, setUsdtBalance] = useState(new Decimal(0));
  const [solBalance, setSolBalance] = useState(new Decimal(0));

  const [curRoundId, setCurRoundId] = useState(0);
  const [solPrice, setSolPrice] = useState(100);

  const [isUsdt, setIsUsdt] = useState(false);

  const [, setSaleState] = useState(presaleStates.IN_FUTURE);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [txInProgress, setTxInProgress] = useState(false);

  // const [currentRound, setCurrentRound] = useState<Round>({
  //   endTime: new Date(),
  //   id: 0,
  //   tokenPrice: new Decimal(0.1),
  // });
  const [appConfig, setAppConfig] = useState(AppConfig.dummy());
  const [availableForPurchase, setAvailableForPurchase] = useState(
    new Decimal(0)
  );
  const [timerData, setTimerData] = useState({
    days: 23,
    hours: 13,
    minutes: 10,
    seconds: 41,
  });

  const getSaleState = () => {
    const curTime = Date.now();
    const startTime = appConfig.start_time.getTime();
    const endTime = getNextRound(curRoundId).end_time.getTime();
    if (curTime < startTime) {
      return presaleStates.IN_FUTURE;
    } else if (curTime >= startTime && curTime < endTime) {
      return presaleStates.RUNNING;
    } else {
      return presaleStates.EXPIRED;
    }
  };

  const updateProgressBar = useCallback(() => {
    const currentTime = Math.floor(new Date().getTime() / 1000); // Current time in seconds
    let remainingTime = 0;
    const _saleState = getSaleState();
    if (_saleState === presaleStates.IN_FUTURE) {
      remainingTime =
        Math.floor(appConfig.start_time.getTime() / 1000) - currentTime;
    } else if (_saleState === presaleStates.RUNNING) {
      remainingTime =
        Math.floor(appConfig.rounds[curRoundId].end_time.getTime() / 1000) -
        currentTime;
    }
    setSaleState(_saleState);
    if (remainingTime <= 0) {
      remainingTime = 0;
    }
    const days = Math.floor(remainingTime / (24 * 60 * 60));
    const hours = Math.floor((remainingTime % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((remainingTime % (60 * 60)) / 60);
    const seconds = Math.floor(remainingTime % 60);
    setTimerData({
      days,
      minutes,
      hours,
      seconds,
    });
  }, [curRoundId, appConfig]);

  const getNextRound = (curId: number) => {
    if (curId == appConfig.rounds.length - 1) {
      return appConfig.rounds[curId];
    }
    return appConfig.rounds[curId + 1];
  };
  const getCurrentRoundIdx = (rounds: Round[]) => {
    const curTime = Date.now();
    for (let i = 0; i < rounds.length; i++) {
      if (rounds[i].end_time.getTime() > curTime) {
        return i;
      }
    }
    return rounds.length - 1;
  };

  const syncInitialState = async () => {
    try {
      await fetchIcoState();
      const _inSale = await getTokensInSale(connection);
      setAvailableForPurchase(_inSale);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchIcoState = async () => {
    try {
      const accountInfo = await connection.getAccountInfo(
        appConfigPDA,
        "processed"
      );
      const deserializedData = AppConfigSchema.decode(accountInfo?.data);
      setAppConfig(new AppConfig(deserializedData));
    } catch (error: unknown) {
      console.log("Fetch Ico state", error);
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
      const _balance = await getSPlTokenBalance(connection, _ata);
      setUsdtAta(_ata);
      setUsdtBalance(new Decimal(_balance));
      console.log(_balance.toString());
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSolBalance = async () => {
    try {
      if (!publicKey) {
        setSolBalance(new Decimal(0));
        return;
      }
      const balance = await connection.getBalance(publicKey);
      //todo check if balance excludes rent
      setSolBalance(new Decimal(balance));
    } catch (error) {
      console.log(error);
    }
  };

  const purchaseWithUSDT = async () => {
    try {
      if (!publicKey) {
        toast.error("Wallet not connected");
        return;
      }
      let parsedUsdtAmount = deci(usdtAmount);
      if (parsedUsdtAmount === null) {
        toast.error("Enter valid amount");
        return;
      }
      parsedUsdtAmount = parsedUsdtAmount.mul(Math.pow(10, usdt.decimals));
      if (parsedUsdtAmount?.gt(usdtBalance)) {
        toast.error("Amount exceeds balance");
        return;
      }
      const curRound = appConfig.rounds[curRoundId];

      if (curRound.end_time.getTime() < Date.now()) {
        toast.error("Round ended");
        return;
      }
      const receivable = deci(
        deci(receivableToken)!.mul(Math.pow(10, token.decimals)).toFixed(0)!
      );
      if (availableForPurchase.lt(receivable!)) {
        toast.error("Amount exceeds purchasable quantity");
        return;
      }

      const tx = await getPurchaseTx(
        publicKey,
        appConfig.deposit_acc,
        parsedUsdtAmount.toString(),
        true,
        connection
      );
      const response = await sendTransaction(tx, connection);
      console.log(response);
      toast.success(`Purchase success`);
      setTimeout(() => {
        fetchSolBalance();
        syncTokenBalance();
        syncInitialState();
      }, 3000);
      fetchSolBalance();
      syncTokenBalance();
      syncInitialState();
    } catch (error) {
      toast.error("Something went wrong");
      console.log(error);
    }
  };

  const purchaseWithSol = async () => {
    try {
      if (!publicKey) {
        toast.error("Wallet not connected");
        return;
      }
      let parsedSolAmount = deci(solAmount);
      if (parsedSolAmount === null) {
        toast.error("Enter valid amount");
        return;
      }
      parsedSolAmount = parsedSolAmount.mul(Math.pow(10, 9));
      if (parsedSolAmount?.gt(solBalance)) {
        toast.error("Amount exceeds balance");
        return;
      }
      const curRound = appConfig.rounds[curRoundId];

      if (curRound.end_time.getTime() < Date.now()) {
        toast.error("Round ended");
        return;
      }
      const receivable = deci(
        deci(receivableToken)!.mul(Math.pow(10, token.decimals)).toFixed(0)!
      );
      if (availableForPurchase.lt(receivable!)) {
        toast.error("Amount exceeds purchasable quantity");
        return;
      }

      const tx = await getPurchaseTx(
        publicKey,
        appConfig.deposit_acc,
        parsedSolAmount.toString(),
        false,
        connection
      );
      // const response = await sendTransaction(tx, connection);
      // console.log(response);
      const recentBlockhash = await connection.getLatestBlockhash();
      tx.recentBlockhash = recentBlockhash.blockhash;
      tx.feePayer = publicKey;
      const response = await signTransaction!(tx);
      try {
        const res = await connection.sendRawTransaction(response.serialize());
        console.log(res);
      } catch (error) {
        if (error instanceof SendTransactionError) {
          const logs = await error.getLogs(connection);
          console.log(logs);
        }
        console.log(error);
      }

      //end
      toast.success(`Purchase success`);
      setTimeout(() => {
        fetchSolBalance();
        syncTokenBalance();
        syncInitialState();
      }, 3000);
      fetchSolBalance();
      syncTokenBalance();
      syncInitialState();
    } catch (error) {
      toast.error("Something went wrong");
      console.log(error);
    }
  };

  const maxToken = () => {
    // if (isUsdt) {
    //   setUsdtAmount(usdtBalance.div(Math.pow(10, usdt.decimals)).toString());
    // } else {
    //   setSolAmount(solBalance.div(Math.pow(10, 9)).toString());
    // }
    // calculateReceivable();
    calculateMaxReceivable();
  };

  const calculateRequired = useCallback(() => {
    const requiredReceivable = deci(receivableToken);
    if (requiredReceivable == null) return;
    const round = appConfig.rounds[curRoundId];
    const price = round.round_price.div(Math.pow(10, round.price_decimals));
    const reqUsdAmount = requiredReceivable.mul(price);

    if (isUsdt) {
      setUsdtAmount(reqUsdAmount.toFixed(usdt.decimals));
    } else {
      const reqSolAmount = reqUsdAmount.div(solPrice).toFixed(9); // 9 decimals for solana
      setSolAmount(reqSolAmount);
    }
  }, [receivableToken, appConfig.rounds, curRoundId, isUsdt, solPrice]);

  useEffect(calculateRequired, [calculateRequired]);

  const calculateMaxReceivable = useCallback(() => {
    //calculate max receivable
    const round = appConfig.rounds[curRoundId];
    const price = round.round_price.div(Math.pow(10, round.price_decimals));

    if (isUsdt) {
      const usdt_amount = usdtBalance.div(Math.pow(10, usdt.decimals));
      const amount = usdt_amount.div(price);
      setReceivableToken(
        Decimal.min(amount, availableForPurchase).toFixed(token.decimals)
      );
    } else {
      const sol_amount = solBalance.div(Math.pow(10, 9));
      const usdt_value = sol_amount.mul(solPrice);
      const amount = usdt_value.div(price);
      setReceivableToken(
        Decimal.min(
          amount,
          availableForPurchase.div(Math.pow(10, token.decimals))
        ).toFixed(token.decimals)
      );
    }
  }, [
    appConfig.rounds,
    curRoundId,
    usdtBalance,
    isUsdt,
    availableForPurchase,
    solBalance,
    solPrice,
  ]);

  const handleBuyClick = async () => {
    setTxInProgress(true);
    if (isUsdt) {
      await purchaseWithUSDT();
    } else {
      await purchaseWithSol();
    }
    setTxInProgress(false);
  };

  // useEffect(() => {
  //   calculateReceivable();
  // }, [calculateReceivable, solPrice]);

  useEffect(() => {
    console.log("contract state ", solBalance.toString());
  }, [solBalance]);

  const updateSolPrice = () => {
    const fetchAndUpdate = async () => {
      try {
        const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=SOLUSDT`;
        const response = await fetch(url);
        const data = await response.json();
        setSolPrice(parseFloat(data.lastPrice));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        console.log("fetch price error");
      }
    };
    fetchAndUpdate();
    setTimeout(() => {
      fetchAndUpdate();
    }, 1000);
    // setInterval(fetchAndUpdate, 2000);
  };
  useEffect(() => {
    const cur_round_id = getCurrentRoundIdx(appConfig.rounds);
    setCurRoundId(cur_round_id);
  }, [appConfig]);

  useEffect(() => {
    syncInitialState();
    updateSolPrice();
  }, []);

  const syncTokenBalance = () => {
    if (tokenAta == null) return;
    getSPlTokenBalance(connection, tokenAta).then((res) => {
      setTokenBalance(res);
    });
  };
  useEffect(() => {
    syncTokenBalance();
  }, [connection, tokenAta]);

  useEffect(() => {
    syncUserUSDTInfo();
    fetchSolBalance();
    if (publicKey) {
      const _tknAta = getUserTokenAta(publicKey);
      setTokenAta(_tknAta);
    }
  }, [publicKey]);

  // Function to start the countdown
  function startCountdown() {
    timerRef.current = setInterval(() => {
      updateProgressBar();
    }, 1000);
  }

  const calculatePrice = (round: Round) => {
    return round.round_price.div(Math.pow(10, round.price_decimals));
  };

  useEffect(() => {
    startCountdown();
    return () => {
      clearInterval(timerRef.current);
    };
  }, [curRoundId, updateProgressBar]);

  return (
    <div className="sail-container">
      <div className="sail-top-front">
        <img src="/wp-includes/images/public-sail-box-top-front.png" alt="" />
      </div>
      <div className="sail-top-back">
        <img src="/wp-includes/images/public-sail-box-top-back.png" alt="" />
      </div>
      <div className="sail-box">
        <div className="sail-inner">
          <div
            className="sail-inner-heading"
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 10px",
              borderRadius: "10px",
              background: "#2020206b",
              alignItems: "center",
            }}
          >
            <h2 style={{ marginTop: "0px" }}>Presale Stage {curRoundId + 1}</h2>
            <p>$ {calculatePrice(appConfig.rounds[curRoundId]).toString()}</p>
          </div>
          <div className="timer-wrap">
            <div className="timer-box">
              <div className="timer-digits">
                <h3 className="timer-digit">
                  {timerData.days}
                  <p>D</p>
                </h3>
                {/* <h3 className="timer-day">D</h3> */}
              </div>
              <div className="timer-colon">:</div>
              <div className="timer-digits">
                <h3 className="timer-digit">
                  {timerData.hours}
                  <p>H</p>
                </h3>
                {/* <h3 className="timer-day">H</h3> */}
              </div>
              <div className="timer-colon">:</div>
              <div className="timer-digits">
                <h3 className="timer-digit">
                  {timerData.minutes}
                  <p>M</p>
                </h3>
                {/* <h3 className="timer-day">M</h3> */}
              </div>
              <div className="timer-colon">:</div>
              <div className="timer-digits">
                <h3 className="timer-digit">
                  {timerData.seconds}
                  <p>S</p>
                </h3>
                {/* <h3 className="timer-day">S</h3> */}
              </div>
            </div>
          </div>
          <div className="sail-inner-price">
            <p>
              Join Others Before the Price increases to : $
              {calculatePrice(getNextRound(curRoundId)).toString()} $
            </p>
          </div>
          <div className="mecca-rate-wrap">
            <h4>
              1 MECCA ={" "}
              {calculatePrice(appConfig.rounds[curRoundId]).toString()} $
            </h4>
          </div>
          <TokenProgress
            amountInSale={availableForPurchase
              .add(appConfig.tokens_sold)
              .div(Math.pow(10, token.decimals))}
            soldAmount={appConfig.tokens_sold.div(Math.pow(10, token.decimals))}
          />
          <div
            className="flex"
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <WalletMultiButton />
          </div>

          <div className="sail-body">
            <div className="amount-wrap">
              {/* <div className="amount-row">
                <h4>Tokens SOLD :</h4>
                <p>$ {(contractState.tokens_sold.toString())}</p>
              </div> */}
              <div className="amount-row">
                <h4>YOUR HOLDING :</h4>
                <p>{formatBalance(tokenBalance)} MECCA</p>
              </div>
            </div>

            <div className="form-wrap">
              <form id="form">
                <p className="buy-title">Buy with (one of the below)</p>
                <div className="form-radio-wrap">
                  <label className="form-radio-label">
                    <input
                      type="radio"
                      className="buy-input-radio"
                      name="sol-buy"
                      value="sol-buy"
                      defaultChecked
                      style={{
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setIsUsdt(false);
                      }}
                    />
                    <img src="/wp-includes/images/sol-dark-logo.png" alt="" />
                    <span>Sol</span>
                  </label>
                  <label className="form-radio-label">
                    <input
                      type="radio"
                      className="buy-input-radio"
                      name="sol-buy"
                      value="sol-buy"
                      style={{
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setIsUsdt(true);
                      }}
                    />
                    <img src="/wp-includes/images/ustd-logo.png" alt="" />
                    <span>USDT</span>
                  </label>
                </div>

                <div className="inputs-wrap">
                  <div className="w-100">
                    <label htmlFor="mecca-pay">MECCA You receive</label>
                    <div className="input-mecca-container">
                      <input
                        type="text"
                        value={receivableToken}
                        placeholder=""
                        name="mecca-pay"
                        id="mecca-receive"
                        className="input-mecca mecca-receive"
                        onChange={(event) => {
                          updateIfValid(event.target.value, setReceivableToken);
                        }}
                      />
                      <button
                        type="button"
                        className="max-input-mecca-pay max-btn"
                        onClick={maxToken}
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        MAX
                      </button>
                      <img
                        src={`/wp-includes/images/mecca-logo.png`}
                        alt=""
                        className="mecca-logo-input"
                      />
                    </div>
                  </div>
                  <div className="w-100">
                    <label htmlFor="mecca-pay">
                      {isUsdt ? "USDT" : "SOL"} You pay
                    </label>
                    <div className="input-mecca-container">
                      <input
                        type="text"
                        placeholder=""
                        name="mecca-pay"
                        id="mecca-pay"
                        className="input-mecca mecca-pay"
                        readOnly={true}
                        value={isUsdt ? usdtAmount : solAmount}
                        onChange={(event) => {
                          updateIfValid(
                            event.target.value,
                            isUsdt ? setUsdtAmount : setSolAmount
                          );
                        }}
                      />

                      <img
                        src={`/wp-includes/images/${
                          isUsdt ? "ustd" : "sol-dark"
                        }-logo.png`}
                        alt=""
                        className="mecca-logo-input"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleBuyClick}
                  id="submit-btn"
                  type="button"
                  className="submit-btn"
                  style={{
                    display: connected ? "flex" : "none",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <div
                    style={{
                      display: txInProgress ? "inline-block" : "none",
                      width: "24px",
                      height: "24px",
                    }}
                    id="loader"
                    className="btn-sky text-xl"
                  />
                  Buy Now
                </button>

                <div
                  style={{
                    display: connected ? "none" : "flex",
                    justifyContent: "center",
                    marginTop: "14px",
                  }}
                >
                  <WalletMultiButton />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="sail-bottom-front">
        <img
          src="/wp-includes/images/public-sail-box-bottom-front.png"
          alt=""
        />
      </div>
      <div className="sail-bottom-back">
        <img src="/wp-includes/images/public-sail-box-bottom-back.png" alt="" />
      </div>
    </div>
  );
};

export default PresaleBox;
