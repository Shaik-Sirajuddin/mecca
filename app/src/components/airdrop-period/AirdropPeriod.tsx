import { useEffect, useRef, useState } from "react";
import "./style.css";
import { AirdropConfig } from "../../schema/airdrop/AirdropConfig";
import { baseUrl } from "./utils/constants";
import toast from "react-hot-toast";
import { getParsedPublicKey } from "./utils/utils";

const AirdropPeriod = () => {
  const [airdropConfig, setAirdropConfig] = useState(AirdropConfig.dummy());

  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const [timerData, setTimerData] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [address, setAddress] = useState("");

  const fetchConfig = async () => {
    try {
      const url = `${baseUrl}/public/config`;
      const response = await fetch(url);
      const data = await response.json();
      setAirdropConfig(new AirdropConfig(data.body));
    } catch (error) {
      console.log(error);
    }
  };

  const updateTimer = () => {
    const currentTime = Math.floor(new Date().getTime() / 1000); // Current time in seconds
    let remainingTime = 0;
    remainingTime =
      Math.floor(airdropConfig.endTime.getTime() / 1000) - currentTime;

    if (remainingTime < 0) {
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
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Function to start the countdown
  function startCountdown() {
    timerRef.current = setInterval(() => {
      updateTimer();
    }, 1000);
  }

  const requestAirdrop = async () => {
    try {
      const pubkey = getParsedPublicKey(address);
      if (pubkey == null) {
        toast.error("Enter valid address");
        return;
      }

      const response = await fetch(`${baseUrl}/public/claim`, {
        method: "POST",
        body: JSON.stringify({
          user: pubkey.toString(),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if(!data.success){
        toast.error(data.message ?? "Something went wrong")
        return;
      }

      toast.success("Airdrop sent to wallet");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };
  useEffect(() => {
    startCountdown();
    return () => {
      clearInterval(timerRef.current);
    };
  }, [airdropConfig]);
  return (
    <div className="airdrop-period-container">
      <div className="airdrop-period-box">
        <div className="airdrop-period-inner">
          <div className="airdrop-period-head">
            <h2 className="airdrop-period-title">Remaining Airdrop Period</h2>
            <div className="timer-wrap">
              <div className="timer-box">
                <div className="timer-digits">
                  <h3 className="timer-digit">{timerData.days}</h3>
                  <h3 className="timer-day">day</h3>
                </div>
                <div className="timer-colon">:</div>
                <div className="timer-digits">
                  <h3 className="timer-digit">{timerData.hours}</h3>
                  <h3 className="timer-day">hours</h3>
                </div>
                <div className="timer-colon">:</div>
                <div className="timer-digits">
                  <h3 className="timer-digit">{timerData.minutes}</h3>
                  <h3 className="timer-day">min</h3>
                </div>
                <div className="timer-colon">:</div>
                <div className="timer-digits">
                  <h3 className="timer-digit">{timerData.seconds}</h3>
                  <h3 className="timer-day">sec</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="airdrop-period-body">
            <div className="airdrop-period-textbox">
              <h3> Receive MECCA airdrop</h3>
              <p>
                You must have {airdropConfig.minSolAmount} SOL in your wallet on
                the Solana mainnet. MECCA tokens can be airdropped every 24
                hours.
              </p>
            </div>

            <form id="airdrop-form" className="w-100">
              <div className="airdrop-form-wrap">
                <div className="airdrop-form-row">
                  <div className="token-selector">
                    <label htmlFor="token-selection">Token</label>
                    <div className="input-token-container">
                      <img
                        src="/images/mecca-logo.png"
                        alt=""
                        className="mecca-logo-input"
                      />
                      <input
                        type="text"
                        placeholder="0.001"
                        name="token selection"
                        id="token-selection"
                        className="input-mecca token-input "
                      />
                      {/* <span>MECCA</span> */}
                    </div>
                  </div>
                  <div className="wallet-address-input">
                    <label htmlFor="mecca-pay">Wallet address</label>
                    <div className="input-mecca-container">
                      <input
                        type="email"
                        placeholder="Enter your Solana wallet address."
                        name="mecca-pay"
                        id="mecca-pay"
                        className="input-mecca mecca-pay"
                        value={address}
                        onChange={(event) => {
                          setAddress(event.target.value.toString().trim());
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="airdrop-form-btn">
                <button type="button" onClick={requestAirdrop}>
                  Receive
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirdropPeriod;
