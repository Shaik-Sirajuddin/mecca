import { useEffect, useRef, useState } from "react";
import "./style.css";
import { AirdropConfig } from "../../schema/airdrop/AirdropConfig";
import { baseUrl } from "./utils/constants";
import toast from "react-hot-toast";
import { getParsedPublicKey } from "./utils/utils";
import PopUpModal, { PopUpProps } from "../PopUpModal/PopUpModal";

const AirdropPeriod = () => {
  const [airdropConfig, setAirdropConfig] = useState(AirdropConfig.dummy());

  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const [reqInProgress, setReqInProgress] = useState(false);
  const [timerData, setTimerData] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [address, setAddress] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [modalDate, setModalDate] = useState<PopUpProps>({
    type: "success",
    title: "Message from",
    message: "this is details text",
    onClose: () => {},
    show: false,
  });

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
      setReqInProgress(true);
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
      if (!data.success) {
        setModalDate({
          ...modalDate,
          title: "Claim Failed",
          message: data.message.toString() ?? "Something went wrong",
          type: "error",
        });
        setShowModal(true);
        return;
      }
      setModalDate({
        ...modalDate,
        title: "Claimed",
        message: "Airdrop sent to wallet",
        type: "success",
      });
      setShowModal(true);
      // toast.success("Airdrop sent to wallet");
    } catch (error: any) {
      setModalDate({
        ...modalDate,
        title: "Claim Failed",
        message: error.toString(),
        type: "error",
      });
      setShowModal(true);
      console.log(error);
      // toast.error("Something went wrong");
    } finally {
      setReqInProgress(false);
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
                    <label htmlFor="token-selection">MEA</label>
                    <div className="input-token-container">
                      <img
                        src="/wp-includes/images/mecca-logo.png"
                        alt=""
                        className="mecca-logo-input"
                      />
                      <input
                        type="text"
                        value={airdropConfig.amount}
                        name="token selection"
                        id="token-selection"
                        readOnly={true}
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
                        style={{
                          textOverflow: "ellipsis",
                        }}
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
                <button
                  type="button"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                  }}
                  onClick={requestAirdrop}
                >
                  <div
                    style={{
                      display: reqInProgress ? "inline-block" : "none",
                      width: "24px",
                      height: "24px",
                      border: "2px solid #8909a5",
                      borderTop: "2px solid white",
                    }}
                    id="loader"
                    className="btn-sky text-xl"
                  />
                  Receive
                </button>
              </div>
            </form>
          </div>
        </div>
        <PopUpModal
          {...modalDate}
          onClose={() => {
            setShowModal(false);
          }}
          show={showModal}
        />
      </div>
    </div>
  );
};

export default AirdropPeriod;
