import { useSelector } from "react-redux";
import { PlanID } from "../enums/plan";
import { IRootState } from "../app/store";
import { useMemo } from "react";
import { AppState } from "../schema/app_state";
import { formatBalance } from "../utils/utils";
import { splToken } from "../utils/constants";

interface Props {
  plan_id: PlanID;
}

export const ConcentrixChart = ({ plan_id }: Props) => {
  const appStateRaw = useSelector((state: IRootState) => state.global.state);
  const plan = useMemo(() => {
    return AppState.fromJSON(appStateRaw).getPlan(plan_id)!;
  }, [appStateRaw, plan_id]);

  const getMaxFillLevel = () => {
    switch (plan_id) {
      case PlanID.A:
        return 10;
      case PlanID.B:
        return 20;
      case PlanID.C:
        return 30;
      default:
        return 0;
    }
  };

  const maxFillLevel = getMaxFillLevel();
  return (
    <div>
      <h5 className="text-magenta1 text-xs uppercase font-semibold my-3">
        STAGE-{String.fromCharCode(65 + plan_id)} REVENUE
      </h5>

      <div className="flex items-center justify-center px-5 py-3 md:w-[300px] md:h-[300px] mx-auto">
        <div className="circle-wrap">
          <div className="_20-30">
            {[...Array(10)].map((_, idx) => {
              const level = 30 - idx;
              return (
                <div
                  key={level}
                  className={`_${level} ${
                    level <= maxFillLevel ? "c-fill" : ""
                  }`}
                ></div>
              );
            })}
            <div
              className={`level-30 ${maxFillLevel >= 30 ? "fill-text" : ""}`}
              style={{
                display: maxFillLevel >= 30 ? "block" : "none",
              }}
            >
              <div className="level-21-30">Level 21 -30</div>
              <div className="_302">{plan.deep_referral_percentage}%</div>
            </div>
          </div>
          <div className="_11-20">
            {[...Array(10)].map((_, idx) => {
              const level = 20 - idx;
              return (
                <div
                  key={level}
                  className={`_${level} ${
                    level <= maxFillLevel ? "c-fill" : ""
                  }`}
                ></div>
              );
            })}
            <div
              style={{
                display: maxFillLevel >= 20 ? "block" : "none",
              }}
              className={`level-20 ${maxFillLevel >= 20 ? "fill-text" : ""}`}
            >
              <div className="level-11-20">Level 11 -20</div>
              <div className="_20">{plan.deep_referral_percentage}%</div>
            </div>
          </div>
          <div className="_1-10">
            {[...Array(10)].map((_, idx) => {
              const level = 10 - idx;
              return (
                <div
                  key={level}
                  className={`_${level} ${
                    level <= maxFillLevel ? "c-fill" : ""
                  }`}
                ></div>
              );
            })}
            <div className="level-10 fill-text">
              <div className="level-7-10">Level 7 - 10</div>
              <div className="_102">{1}%</div>
            </div>
            <div className="center-dot"></div>
          </div>
        </div>
      </div>
      <h5 className="text-white text-xs uppercase font-semibold my-3 text-center">
        Deep Bonus
      </h5>
      <div>
        <div className="mt-4 mb-4 lg:px-11 px-5 py-6 lg:py-8 bg-[url(withdrawl-frame.png)] bg-full bg-center bg-no-repeat">
          <div className="text-white text-center">
            <div>Owner Bonus - Daily Reward</div>
            <div className="font-bold">
              {formatBalance(plan.daily_reward)} {splToken.symbol}
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-4 mt-4 mb-4 justify-between">
        <div className="lg:px-11 px-5 py-6 lg:py-8 bg-[url(withdrawl-frame.png)] bg-full bg-center bg-no-repeat">
          <div className="text-white text-center">
            <div>Direct (Level 1)</div>
            <div className="font-bold">{plan.direct_referral_percentage} %</div>
          </div>
        </div>
        <div className="lg:px-11 px-5 py-6 lg:py-8 bg-[url(withdrawl-frame.png)] bg-full bg-center bg-no-repeat">
          <div className="text-white text-center">
            <div>Active (Level 2-6)</div>
            <div className="font-bold">{plan.active_referral_percentage} %</div>
          </div>
        </div>
      </div>
    </div>
  );
};
