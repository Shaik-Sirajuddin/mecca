import Decimal from "decimal.js";
import {
  formatBalance,
  isValidNumber,
  updateIfValid,
} from "../../utils/helper";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import LockupTimer from "../LockUpTimer/LockUpTimer";
import { toast } from "react-toastify";
import "./style.css";
import { splToken } from "../../utils/constants";
interface Props {
  title: string;
  type: string;
  buttonLabel: string;
  has_amount_selection: boolean;
  availableQuantity: Decimal;
  color: string;
  onWithdrawClick: (amount: Decimal) => Promise<void>;
  onClaimClick: () => Promise<void>;
  is_withdraw_under_progress: boolean;
  hasLockUp: boolean;
  lockUpTime: number;
  //time s at which withdrawl request has been made
  request_time_s: number;
}
const WithdrawlBox: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [withdrawQuantity, setWithdrawQuantity] = useState("0");

  const [claimLoading, setClaimLoading] = useState(false);
  const [unstakeLoading, setUnStakeLoading] = useState(false);

  const [timerCompleted, setTimerCompleted] = useState(false);

  function convertSecondsToDaysHours(seconds: number) {
    if (seconds < 0) seconds = 0; // Ensure non-negative input

    const days = Math.floor(seconds / (24 * 3600)); // Calculate full days
    const hours = Math.floor((seconds % (24 * 3600)) / 3600); // Remaining hours

    return { days, hours };
  }

  const maxClick = () => {
    setWithdrawQuantity(
      new Decimal(props.availableQuantity)
        .div(Math.pow(10, splToken.decimals))
        .toString()
    );
  };

  return (
    <div
      className={`unstaking-col bg-${props.type}`}
      key={props.title}
      style={{
        height: "fit-content",
      }}
    >
      <div className={`unstaking-head`}>
        <h2>{props.title}</h2>
      </div>
      <div className="staking-boxs">
        <div className="flex flex-col staking-input-boxs gap-3">
          <div className="staking-input-box">
            <p className="staking-input-label">
              {t("withdrawal.availableQuantityLabel")}
            </p>
            <div>
              <p
                className={`staking-input text-${props.color}`}
                style={{ flex: "1" }}
              >
                {formatBalance(props.availableQuantity)}
              </p>
            </div>
          </div>

          {props.has_amount_selection && (
            <div className="staking-input-box" style={{ display: "block" }}>
              <p className="staking-input-label">
                {t("withdrawal.withdrawalAmountLabel")}
              </p>
              <div className="withdraw-input-wrapper">
                <input
                  type="text"
                  onChange={(event) => {
                    updateIfValid(event.target.value, setWithdrawQuantity);
                  }}
                  value={withdrawQuantity}
                  className="staking-input interest-withdrawal-amount text-gray-1 font-medium"
                  // className={`staking-input text-${props.color}`}
                />
                <button
                  onClick={maxClick}
                  className={`max-btn bg-${props.color} text-white d-inline-flex`}
                >
                  {t("withdrawal.maxButton")}
                </button>
              </div>
            </div>
          )}
          {!props.has_amount_selection && (
            <div
              className=""
              style={{
                height: "64px",
              }}
            ></div>
          )}
        </div>
        <button
          className={`unstaking-btn bg-${props.color} but-primary`}
          style={{
            display: "flex",
            gap: "4px",
          }}
          disabled={props.is_withdraw_under_progress}
          onClick={async () => {
            if (!isValidNumber(withdrawQuantity)) {
              toast.info("Enter valid amount");
              return;
            }
            setUnStakeLoading(true);
            await props.onWithdrawClick(new Decimal(withdrawQuantity));
            setUnStakeLoading(false);
          }}
        >
          <div
            style={{
              display: unstakeLoading ? "inline-block" : "none",
              width: "18px",
              height: "18px",
            }}
            id="loader"
            className="btn-sky text-xl"
          />
          {props.buttonLabel}
        </button>
        {props.hasLockUp && (
          <p className={`text-14 text-white text-center mb-3`}>
            {t("withdrawal.lockupNote", {
              days: convertSecondsToDaysHours(props.lockUpTime).days,
            })}
          </p>
        )}
        <div className="lookup-timer-wrap">
          {props.hasLockUp && !timerCompleted && (
            <h3 className={`text-18 text-center font-bold text-white`}>
              {t("withdrawal.lockupTimerTitle")}
            </h3>
          )}
          {props.hasLockUp && !timerCompleted && (
            <LockupTimer
              onTimerComplete={() => {
                setTimerCompleted(true);
              }}
              endTime={
                new Date((props.lockUpTime + props.request_time_s) * 1000)
              }
              color="#3d5741"
            />
          )}
          {props.type !== "interest" && (
            <button
              disabled={!(props.hasLockUp && timerCompleted)}
              className={`unstaking-btn claim-btn btn-primary bg-${props.color} but-primary`}
              style={{
                display: "flex",
                gap: "4px",
              }}
              onClick={async () => {
                setClaimLoading(true);
                await props.onClaimClick();
                setClaimLoading(false);
              }}
            >
              <div
                style={{
                  display: claimLoading ? "inline-block" : "none",
                  width: "18px",
                  height: "18px",
                }}
                id="loader"
                className="btn-sky text-xl"
              />
              {t(`withdrawal.claimButton`)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawlBox;
