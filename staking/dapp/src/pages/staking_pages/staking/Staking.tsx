import { Helmet } from "react-helmet-async";
import RootLayout from "../layout/RootLayout";
import "./style.css";

// Updated Staking Page
import { useCallback, useEffect, useState } from "react";
import FaqsContainer from "../../../components/faqs/faqs";
import UserStakeData from "../../../components/UserStakeData/UserStakeData";

import DepositBox from "../../../components/DepositBox/DepositBox";
import { useTranslation } from "react-i18next";
import { useConnection } from "@solana/wallet-adapter-react";
import { baseUrl, splToken } from "../../../utils/constants";
import { AppState } from "../../../schema/app_state_schema";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "../../../app/store";
import { setAppState } from "../../../features/globalData/globalDataSlice";
import { formatBalance } from "../../../utils/helper";
import { IStats } from "../../../interface/IStats";
import Decimal from "decimal.js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { IDailyStats } from "../../../interface/IDailyStats";
import { getAppState } from "../../../utils/web3";
const Staking = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { connection } = useConnection();
  const appState: AppState = useSelector(
    (state: IRootState) => new AppState(state.global.state)
  );

  const [stats, setStats] = useState<IStats>({
    day: "0",
    standy: "0",
  });

  const [chartData, setChartData] = useState<IDailyStats[]>([]);

  const getParsedData = (data: IDailyStats[]) => {
    const res = data.map((item) => {
      return {
        date: new Date(item.date).toLocaleDateString(),
        stakedAmount: item.stakedAmount,
      };
    });
    return res;
  };
  const syncStats = async () => {
    try {
      const response = await fetch(`${baseUrl}/public/stats`);
      const data = await response.json();
      setStats(data.body.interest);

      const _chartResponse = await fetch(`${baseUrl}/public/chart-data`);
      const _chartData = await _chartResponse.json();
      console.log(_chartData.body.stats, "Chartd ate");
      setChartData(_chartData.body.stats);
    } catch (error) {
      console.log(error);
    }
  };

  // const { publicKey, sendTransaction } = useWallet();

  const fetchAppState = useCallback(async () => {
    try {
      const deserializedData = await getAppState(connection);

      dispatch(setAppState(deserializedData));
      // console.log(data);
    } catch (error: unknown) {
      console.log(error);
    }
  }, [connection, dispatch]);

  useEffect(() => {
    fetchAppState();
    syncStats();
  }, [fetchAppState]);

  return (
    <RootLayout>
      <Helmet>
        <title>Staking Page</title>
        <meta
          name="description"
          content="Welcome to the Presale page of my application."
        />
      </Helmet>
      <div className="wrapper withdrawal-bg">
        <section className="staking-banner-sec">
          <div className="container" style={{'maxWidth' : '1100px'}}>
            <div className="staking-banner-wrap">
              <div className="row">
                <div className="col-md-12">
                  <div className="staking-banner-textbox">
                    <h1>
                      Build Web3 on <span>MECCA</span>
                    </h1>
                    <p>
                      A community-driven blockchain ecosystem of Layer-1 and
                      Layer-2 scaling solutions.
                    </p>
                  </div>

                  <div className="dashboard-wrapper">
                    <div className="flex gap-3">
                      <div className="col-8">
                        <div className="dashboard-content w-100 mb-3 bg-white-2">
                          <h2 className="text-24 text-gray-4 font-bold mb-4">
                            {t("staking.title")}
                          </h2>
                          {/* Dashboard content */}
                          <div className="w-100">
                            <div className="d-flex content-box gap-3 mb-3">
                              <div className="col bg-purple-1 p-3 rounded-3">
                                <h3 className="text-16 text-white mb-4 fw-bold">
                                  {t("staking.depositApy")}
                                </h3>
                                <div className="flex gap-3">
                                  <h4 className="text-white text-24">
                                    {appState.cur_interest_rate /
                                      Math.pow(10, splToken.decimals)}
                                  </h4>
                                  <span className="text-white">%</span>
                                </div>
                              </div>
                              <div className="col bg-white p-3 rounded-3">
                                <div className="flex align-items-center mb-4 justify-content-between">
                                  <h3 className="text-16 text-gray-1 fw-bold">
                                    {t("staking.stakingPool")}
                                  </h3>
                                  {/* <div className="flex gap-1">
                                    <h4 className="text-purple-1 text-16">
                                      100,000
                                    </h4>
                                    <span className="text-gray-1 text-16">
                                      participant
                                    </span>
                                  </div> */}
                                </div>
                                <div className="w-100 flex align-items-center gap-2 mt-2">
                                  <h3 className="text-22 text-purple-1 font-bold">
                                    {formatBalance(appState.staked_amount)}
                                  </h3>
                                  <p className="text-14">{splToken.symbol}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex interest-wrap gap-3">
                              <div className="col bg-white p-3 rounded-3">
                                <div className="flex align-items-center mb-4 gap-2">
                                  <h3 className="text-16 text-gray-1 fw-bold">
                                    {t("staking.participants")}
                                  </h3>
                                  <img
                                    src="/images/question-mark-pink.png"
                                    alt=""
                                  />
                                </div>
                                <div className="w-100 flex align-items-center gap-2 mt-2">
                                  <h3 className="text-22 text-pink font-bold">
                                    {appState.total_registered}
                                  </h3>
                                  <p className="text-14">Staker</p>
                                </div>
                              </div>
                              <div className="col bg-white p-3 rounded-3">
                                <div className="flex align-items-center justify-content-between">
                                  <h3 className="text-16 text-gray-1 mb-3 fw-bold">
                                    {t("staking.interestPaidToday")}
                                  </h3>
                                </div>
                                <div className="w-100 flex align-items-center gap-2 mt-2">
                                  <h3 className="text-22 text-purple-1 font-bold">
                                    {formatBalance(new Decimal(stats.day))}
                                  </h3>
                                  <p className="text-14">{splToken.symbol}</p>
                                </div>
                              </div>
                              <div className="col bg-white p-3 rounded-3">
                                <div className="flex align-items-center justify-content-between">
                                  <h3 className="text-16 text-gray-1 mb-3 fw-bold">
                                    {t("staking.totalInterestStandby")}
                                  </h3>
                                </div>
                                <div className="w-100 flex gap-2 align-items-center mt-2">
                                  <h3 className="text-22 text-purple-1 font-bold">
                                    {formatBalance(new Decimal(stats.standy))}
                                  </h3>
                                  <p className="text-14">{splToken.symbol}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="dashboard-content w-100 mb-3 bg-white-2">
                          <div className="w-100 flex align-items-center justify-content-between mb-4 chart-head">
                            <h2 className="text-24 text-gray-4 font-bold">
                              {t("staking.chartTitle")}
                            </h2>
                          </div>
                          <div
                            className="w-100"
                            style={{
                              height: "320px",
                            }}
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={getParsedData(chartData)}
                                margin={{
                                  top: 5,
                                  right: 30,
                                  left: 20,
                                  bottom: 5,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis dataKey="stakedAmount" />
                                <Tooltip />
                                <Legend />
                                <Line
                                  type="monotone"
                                  dataKey="stakedAmount"
                                  stroke="#9807b5"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                      <div className="col-4 ">
                        <div className="w-100 dasboard-content-row">
                          <UserStakeData />
                          <DepositBox onStake={fetchAppState} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="faqs-sec">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="faqs-heading">
                  <h2 className="text-24 text-blue-1 font-bold mb-5">
                    Frequently asked questions
                  </h2>
                </div>
              </div>
            </div>
            <div className="w-100">
              <div className="w-100 faqs-wrapper">
                <FaqsContainer />
              </div>
            </div>
          </div>
        </section>
      </div>
    </RootLayout>
  );
};

export default Staking;
