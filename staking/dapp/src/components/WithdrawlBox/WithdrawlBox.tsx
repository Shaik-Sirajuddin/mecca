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

interface Props {
  title: string;
  type: string;
  buttonLabel: string;
  has_amount_selection: boolean;
  availableQuantity: Decimal;
  color: string;
  onWithdrawClick: (amount: Decimal) => void;
  onClaimClick: () => void;
  hasLockUp: boolean;
  lockUpTime: number;
  //time s at which withdrawl request has been made
  request_time_s: number;
}
const WithdrawlBox: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [withdrawQuantity, setWithdrawQuantity] = useState("0");

  const maxClick = () => {
    setWithdrawQuantity(formatBalance(props.availableQuantity));
  };

  return (
    <div className={`unstaking-col bg-${props.type}`} key={props.title}>
      <div className={`unstaking-head`}>
        <h2>{props.title}</h2>
      </div>
      <div className="staking-boxs">
        <div className="flex flex-col staking-input-boxs gap-3">
          <div className="staking-input-box">
            <p className="staking-input-label">
              {t("withdrawal.availableQuantityLabel")}
            </p>
            <p className={`staking-input text-${props.color}`}>
              {formatBalance(props.availableQuantity)}
            </p>
            {props.has_amount_selection && (
              <button
                onClick={maxClick}
                className={`max-btn bg-${props.color} text-white d-inline-flex`}
              >
                {t("withdrawal.maxButton")}
              </button>
            )}
          </div>

          {props.has_amount_selection && (
            <div className="staking-input-box">
              <p className="staking-input-label">
                {t("withdrawal.withdrawalAmountLabel")}
              </p>
              <input
                type="text"
                onChange={(event) => {
                  updateIfValid(event.target.value, setWithdrawQuantity);
                }}
                value={withdrawQuantity}
                className="staking-input interest-withdrawal-amount text-gray-1 font-medium"
                // className={`staking-input text-${props.color}`}
              />
            </div>
          )}
        </div>
        <button
          className={`unstaking-btn bg-${props.color} but-primary`}
          onClick={() => {
            if (!isValidNumber(withdrawQuantity)) {
              toast.info("Enter valid amount");
              return;
            }
            props.onWithdrawClick(new Decimal(withdrawQuantity));
          }}
        >
          {props.buttonLabel}
        </button>
        <p className={`text-14 text-white text-center mb-3`}>
          {t("withdrawal.lockupNote")}
        </p>
        <div className="lookup-timer-wrap">
          <h3 className={`text-18 text-center font-bold text-white`}>
            {t("withdrawal.lockupTimerTitle")}
          </h3>
          {props.hasLockUp && (
            <LockupTimer
              endTime={
                new Date((props.lockUpTime + props.request_time_s) * 1000)
              }
              color="#3d5741"
            />
          )}
          <button
            disabled={false}
            onClick={() => {
              props.onClaimClick();
            }}
            className={`unstaking-btn claim-btn btn-primary bg-${props.color} but-primary`}
          >
            {t("withdrawal.claimButton")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawlBox;
