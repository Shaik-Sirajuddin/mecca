import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { UserData } from "../schema/user_data";
import { IRootState } from "../app/store";
import {
  copyToClipboard,
  deci,
  formatBalance,
  formatLocalDateString,
  updateIfValid,
} from "../utils/utils";
import { AppState } from "../schema/app_state";
import { siteUrl, splToken } from "../utils/constants";
import {
  fetchUserData,
  getATA,
  getTokenBalance,
  getUserDataAcc,
  getWithdrawTransaction,
} from "../utils/web3";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import Decimal from "decimal.js";
import { SendTransactionError } from "@solana/web3.js";
import { Plan } from "../schema/plan";
import toast from "react-hot-toast";
import { UserStore } from "../schema/user_store";
import ModalSuccess from "../components/models/ModelSuccess";
import ModelFailure from "../components/models/ModelFailure";
import {
  setTokenBalance,
  setUserAtaExists,
  setUserData,
} from "../features/user/userSlice";
import { userJoined } from "../network/api";

const Dashboard = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [withdrawAmount, setWithdrawAmount] = useState("0");
  const [txLoading, setTxLoading] = useState(false);
  const dispatch = useDispatch();

  const [modalData, setModalData] = useState({
    title: "",
    description: "",
    type: "",
    show: true,
  });
  const userDataRaw = useSelector((state: IRootState) => state.user.data);
  // Use useMemo to memoize the result of UserData.fromJSON
  const userData = useMemo(() => {
    return UserData.fromJSON(userDataRaw);
  }, [userDataRaw]); // Only recomput

  const userStoreRaw = useSelector((state: IRootState) => state.user.store);
  const userStore = useMemo(() => {
    return UserStore.fromJSON(userStoreRaw);
  }, [userStoreRaw]);

  const crewProfit = useMemo(() => {
    return userStore.getCrewProfit();
  }, [userStore]);

  const appStateRaw = useSelector((state: IRootState) => state.global.state);
  const appState = useMemo(() => {
    return AppState.fromJSON(appStateRaw);
  }, [appStateRaw]);

  const rewardPercent = useMemo(() => {
    return userData.referral_reward
      .add(
        userData
          .totalDailyReward(appState)
          .sub(userData.accumulated.daily_reward)
      )
      .div(appState.getPlan(userData.plan_id)!.investment_required)
      .mul(100)
      .toFixed(2);
  }, [appState, userData]);
  // const totalRewards = useMemo(() => {
  //   return crewProfit.active
  //     .add(crewProfit.deep)
  //     .add(crewProfit.direct)
  //     .add(userData.availableForWithdraw(appState));
  // }, [
  //   appState,
  //   crewProfit.active,
  //   crewProfit.deep,
  //   crewProfit.direct,
  //   userData,
  // ]);

  const syncUserData = async () => {
    if (!publicKey) return;
    const userDataAcc = getUserDataAcc(publicKey);
    const userData = await fetchUserData(userDataAcc, connection);
    if (userData) {
      dispatch(setUserData(userData.toJSON()));
      // if user referral staus isn't completed hit endpoint for sync
      if (!userData.referral_distribution.completed) {
        userJoined(publicKey);
      }
    }
    const userAta = getATA(publicKey);
    const userBalance = await getTokenBalance(connection, userAta);
    dispatch(setUserAtaExists(userBalance != null));
    dispatch(setTokenBalance(userBalance ? userBalance.toString() : "0"));
  };

  const withdraw = async () => {
    try {
      setTxLoading(true);
      if (!publicKey) return;
      if (!withdrawAmount) {
        //TODO : modal
        setModalData({
          title: "Invalid Input",
          description: "Enter valid amount for withdrawl",
          show: true,
          type: "error",
        });
        return;
      }
      let parsedWithdrawlAmont = deci(withdrawAmount);
      if (parsedWithdrawlAmont == null || parsedWithdrawlAmont.eq(0)) {
        //TODO : modal
        setModalData({
          title: "Invalid Input",
          description: "Enter valid amount for withdrawl",
          show: true,
          type: "error",
        });
        return;
      }
      parsedWithdrawlAmont = Decimal.floor(
        parsedWithdrawlAmont.mul(Decimal.pow(10, splToken.decimals))
      );
      const tx = getWithdrawTransaction(publicKey, parsedWithdrawlAmont);

      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      const signedTx = await signTransaction!(tx);
      const broadcastResponse = await connection.sendRawTransaction(
        signedTx.serialize()
      );
      console.log(broadcastResponse);
      setModalData({
        title: "Transaction Success",
        description: "Withdrawl Successful",
        show: true,
        type: "success",
      });
      syncUserData();
    } catch (error: any) {
      if (error instanceof SendTransactionError) {
        console.log(await error.getLogs(connection));
      }
      console.log(error);
      setModalData({
        title: "Something went wrong",
        description: error.toString(),
        show: true,
        type: "error",
      });
    } finally {
      setTxLoading(false);
    }
  };

  const maxClick = () => {
    setWithdrawAmount(
      userData
        .availableForWithdraw(appState)
        .div(10 ** splToken.decimals)
        .toString()
    );
  };

  const performCopy = async (value: string) => {
    if (await copyToClipboard(value)) {
      toast.success("Copied to Clipoard");
    } else {
      toast.error("Failed to copy!");
    }
  };

  return (
    <>
      <Helmet>
        <title>Mecca || Dashboard</title>
        <meta property="og:title" content="A very important title" />
      </Helmet>

      <div className="w-full bg-black5 relative">
        <div className="w-full max-w-[1162px] mx-auto absolute h-[623px] rounded-full blur-[200px] -top-[400px] left-1/2 -translate-x-1/2 bg-[#6E3359]"></div>

        <section className="w-full relative md:min-h-[600px] lg:min-h-[753px] pb-28 pt-32 lg:pt-[254px]">
          <div className="w-full h-screen absolute top-0 left-0 bg-black5/50 z-10"></div>
          <video
            src="/assets/dashboard.bg.mp4"
            className="w-screen top-0 left-0 bg-cover object-cover h-screen absolute"
            loop
            muted
            autoPlay
          ></video>
          <div className="w-full bg-xl-gradient top-[80vh] absolute h-[185px] z-10 -bottom-1"></div>
          {/* End TeamBee Changes */}
          <div className="w-full max-w-[1152px] mx-auto px-10 relative z-20">
            <div className="w-full text-center">
              <div className="inline-flex items-center justify-center">
                <img
                  src="Mecca-Purple-Logo.png"
                  className="lg:w-[102px] w-[80px] mr-1"
                  alt=""
                />
                <span className="text-center font-dm-sans font-black lg:text-2xl text-base text-white uppercase">
                  CRYPTO
                </span>
              </div>
              <h1 className="text-[32px] lg:text-[94px] leading-10 text-white font-dm-sans font-bold mt-7 mb-16">
                DASHBOARD
              </h1>
              <p className="text-2xl uppercase font-semibold leading-6 mb-1 text-white max-w-[974px] mx-auto mt-2">
                MY CURRENT PARTICIPATION
              </p>
              <h4 className="text-[40px] text-magenta1 font-bold font-dm-sans tracking-normal uppercase ">
                STAGE {Plan.getPlanCode(userData.plan_id)}
              </h4>
              <span
                className={`text-white bg-green1 text-xs font-semibold rounded p-1 ${
                  userData.getRemainingDays(appState) > 0
                    ? "bg-green1"
                    : "bg-orange-400"
                }`}
              >
                {userData.getRemainingDays(appState) > 0 ? "ACTIVE" : "EXPIRED"}
              </span>
              <p className="text-2xl font-semibold text-white uppercasep mt-7">
                PARTICIPATION DAY
              </p>
              <h4 className="text-[40px] font-bold font-dm-sans text-magenta1 leading-tight">
                {formatLocalDateString(
                  new Date(userData.enrolled_at.toNumber() * 1000)
                )}
              </h4>
            </div>
            <div className="w-full pt-[70px]">
              <div className="w-full grid md:grid-cols-2 gap-12 grid-cols-1">
                <div className="w-full gap-12 flex flex-col">
                  <div className="w-full lg:px-11 px-5 py-6 h-fit lg:py-8 bg-[url(stage-b-bg-2.png)] bg-full-3 bg-center bg-no-repeat">
                    <div className="w-full flex items-center justify-between gap-6 flex-wrap mb-5">
                      <p className="text-sm text-white uppercase font-medium flex justify-between flex-1">
                        MY UNIQUE ID <b> {userData.id}</b>
                      </p>
                      <button
                        type="button"
                        className="text-xs font-semibold text-white inline-flex items-center justify-center"
                        onClick={() => {
                          performCopy(userData.id);
                        }}
                      >
                        <svg
                          width={79}
                          height={35}
                          viewBox="0 0 79 35"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0 6.23757C0 5.81727 0.132413 5.40765 0.378437 5.06687L3.43778 0.829302C3.81377 0.308511 4.41701 0 5.05934 0H77C78.1046 0 79 0.895431 79 2V28.4674C79 28.912 78.8518 29.3439 78.5789 29.695L75.564 33.5727C75.1851 34.06 74.6024 34.3451 73.9851 34.3451H2C0.895429 34.3451 0 33.4496 0 32.3451V6.23757Z"
                            fill="#D107FB"
                          />
                        </svg>
                        <span className="absolute">Copy</span>
                      </button>
                    </div>
                    <div className="w-full flex items-center justify-between gap-6 flex-wrap">
                      <p className="text-sm text-white uppercase font-medium flex flex-1 justify-between">
                        Referral Link
                        {/* <b>{shortenAddress(userData.address.toString())}</b> */}
                      </p>
                      <button
                        type="button"
                        className="text-xs font-semibold text-white inline-flex items-center justify-center"
                        onClick={() => {
                          if (publicKey)
                            performCopy(`${siteUrl}?r=${userData.id}`);
                        }}
                      >
                        <svg
                          width={79}
                          height={35}
                          viewBox="0 0 79 35"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0 6.23757C0 5.81727 0.132413 5.40765 0.378437 5.06687L3.43778 0.829302C3.81377 0.308511 4.41701 0 5.05934 0H77C78.1046 0 79 0.895431 79 2V28.4674C79 28.912 78.8518 29.3439 78.5789 29.695L75.564 33.5727C75.1851 34.06 74.6024 34.3451 73.9851 34.3451H2C0.895429 34.3451 0 33.4496 0 32.3451V6.23757Z"
                            fill="#D107FB"
                          />
                        </svg>
                        <span className="absolute">Copy</span>
                      </button>
                    </div>

                    <div className="w-full my-5">
                      <h3 className="text-2xl text-white font-semibold">
                        CURRENT POOL AMOUNT
                      </h3>
                      <h4 className="text-[40px] text-magenta1 font-bold font-dm-sans">
                        {formatBalance(userData.availableForWithdraw(appState))}{" "}
                        {splToken.symbol} <span></span>
                        <span className="text-xs text-gray1 font-medium">
                          Your Balance
                        </span>
                      </h4>
                    </div>

                    <ul className="w-full flex flex-col gap-5">
                      <li>
                        <h4 className="text-base font-semibold text-white">
                          Total Direct Referrals
                        </h4>
                        <h3 className="text-[32px] text-white font-bold font-dm-sans leading-tight">
                          {userStore.directReferred()}
                        </h3>
                      </li>
                      <li>
                        <h4 className="text-base font-semibold text-white">
                          Withdrawn Amount
                        </h4>
                        <h3 className="text-[32px] text-white font-bold font-dm-sans leading-tight">
                          {formatBalance(userData.withdrawn_amount)}{" "}
                          {splToken.symbol}
                        </h3>
                      </li>
                      <li>
                        <h4 className="text-base font-semibold text-white">
                          Revenue from Referrals
                        </h4>
                        <h3 className="text-[32px] text-white font-bold font-dm-sans leading-tight">
                          {formatBalance(
                            userData.referral_reward.add(
                              userData.accumulated.referral_reward
                            )
                          )}{" "}
                          {splToken.symbol}
                        </h3>
                      </li>
                      <li>
                        <h4 className="text-base font-semibold text-white">
                          Remaining Reward Days
                        </h4>
                        <h3 className="text-[32px] text-white font-bold font-dm-sans leading-tight">
                          {userData.getRemainingDays(appState)}
                        </h3>
                      </li>
                      <li>
                        <h4 className="text-base font-semibold text-white">
                          Total Reward Paid
                        </h4>
                        <h3 className="text-[32px] text-white font-bold font-dm-sans leading-tight">
                          {formatBalance(userData.totalDailyReward(appState))}{" "}
                          {splToken.symbol}
                        </h3>
                      </li>
                      <li>
                        <h4 className="text-base font-semibold text-white">
                          Total Fee Paid
                        </h4>
                        <h3 className="text-[32px] text-white font-bold font-dm-sans leading-tight">
                          {formatBalance(userData.totalFeePaid(appState))}{" "}
                          {splToken.symbol}
                        </h3>
                      </li>
                    </ul>
                  </div>
                  <div className="w-full lg:px-11 px-5 py-6 lg:py-8 bg-[url(withdrawl-frame.png)] bg-full bg-center bg-no-repeat">
                    <h3 className="text-2xl font-semibold text-white">
                      RETURN RATE
                    </h3>
                    <p className="text-gray1 text-xs font-medium mb-5">
                      {/* A minimum of 7000 TRX is required for withdrawl. */}
                    </p>

                    <div className="flex items-center gap-3 mb-5">
                      <div
                        style={{
                          height: "48px",
                          width: "100%",
                          borderRadius: "4px",
                          background: `linear-gradient(to right, #D107FB 0%, #E97DFF ${
                            parseFloat(rewardPercent) / 10
                          }%, #313136 ${
                            parseFloat(rewardPercent) / 10
                          }%, #313136 100%)`,
                        }}
                      ></div>
                      <h3 className="text-2xl font-semibold text-white">
                        {rewardPercent}%
                      </h3>
                    </div>
                    <div className="w-full">
                      <ul className="list-decimal text-gray3 pl-6">
                        <li>
                          <p className="text-sm text-gray3 font-normal">
                            A return rate of 1000% indicates plan completion
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="w-full gap-12 flex flex-col">
                  <div className="w-full lg:px-11 px-5 py-6 lg:py-8 bg-[url(withdrawl-frame.png)] bg-full bg-center bg-no-repeat">
                    <h3 className="text-2xl font-semibold text-white">
                      WITHDRAWL
                    </h3>
                    <p className="text-gray1 text-xs font-medium mb-5">
                      {/* A minimum of 7000 TRX is required for withdrawl. */}
                    </p>
                    <form className="w-full" id="add-withdrawl-Form">
                      <div className="w-full">
                        <label
                          htmlFor="withdrawl*"
                          className="text-xs text-white mb-2 block"
                        >
                          Amount*
                        </label>
                        <div className="w-full flex items-center gap-3">
                          <input
                            name="withdrawl*"
                            id="withdrawl*"
                            type="number"
                            placeholder="Enter Amount"
                            className="bg-black1 text-xs rounded border border-black2 w-full py-2.5 px-3 placeholder:text-gray1 text-white"
                            value={withdrawAmount}
                            onChange={(event) => {
                              updateIfValid(
                                event.target.value,
                                setWithdrawAmount
                              );
                            }}
                          />
                          <button
                            type="button"
                            className="text-xs font-semibold text-white inline-flex items-center justify-center"
                            onClick={maxClick}
                          >
                            <svg
                              width={79}
                              height={35}
                              viewBox="0 0 79 35"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M0 6.23757C0 5.81727 0.132413 5.40765 0.378437 5.06687L3.43778 0.829302C3.81377 0.308511 4.41701 0 5.05934 0H77C78.1046 0 79 0.895431 79 2V28.4674C79 28.912 78.8518 29.3439 78.5789 29.695L75.564 33.5727C75.1851 34.06 74.6024 34.3451 73.9851 34.3451H2C0.895429 34.3451 0 33.4496 0 32.3451V6.23757Z"
                                fill="#D107FB"
                              />
                            </svg>
                            <span className="absolute">MAX</span>
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={
                          userStore.directReferred() < 2 ||
                          !withdrawAmount ||
                          withdrawAmount.trim() == "0"
                        }
                        className="text-base relative flex items-center justify-center text-center w-full mt-6 uppercase text-white font-semibold"
                        onClick={withdraw}
                      >
                        <svg
                          width="100%"
                          height="100%"
                          viewBox="0 0 426 41"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0 7.58831C0 7.11587 0.167242 6.65869 0.47209 6.29777L4.90076 1.05452C5.28077 0.604618 5.83975 0.345062 6.42867 0.345062H424C425.105 0.345062 426 1.24049 426 2.34506V33.636C426 34.0662 425.861 34.4849 425.604 34.8301L422.1 39.5391C421.722 40.0462 421.128 40.3451 420.495 40.3451H2C0.895426 40.3451 0 39.4496 0 38.3451V7.58831Z"
                            fill="#D107FB"
                          />
                        </svg>

                        <span className="absolute flex gap-2 justify-center items-center">
                          <div
                            style={{
                              display: txLoading ? "inline-block" : "none",
                            }}
                            id="loader"
                            className="btn-sky text-xl"
                          />
                          <span>{"Withdraw"}</span>
                        </span>
                      </button>
                    </form>

                    <div className="w-full">
                      <h4 className="text-base font-bold text-white mb-4 mt-7">
                        NOTE
                      </h4>
                      <ul className="list-decimal text-gray3 pl-6">
                        <li>
                          <p className="text-sm text-gray3 font-normal">
                            Minimum of 2 Direct Referrals are required for
                            withdrawl
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="w-full lg:px-11 px-5 py-6 lg:py-8 bg-[url(withdrawl-frame.png)] bg-full bg-center bg-no-repeat">
                    {/* <PieChart
                      viewBoxSize={[100, 100]}
                      style={{
                        height: "300px",
                      }}
                      data={[
                        {
                          title: "Direct",
                          value: formatToDecimal(crewProfit.direct).toNumber(),
                          color: "#D107FB",
                        },
                        {
                          title: "Deep",
                          value: formatToDecimal(crewProfit.deep).toNumber(),
                          color: "red",
                        },
                        {
                          title: "Active",
                          value: formatToDecimal(crewProfit.active).toNumber(),
                          color: "green",
                        },
                        {
                          title: "Daily Reward",
                          value: formatToDecimal(
                            userData.totalDailyReward(appState)
                          ).toNumber(),
                          color: "#313136",
                        },
                      ]}
                      // onMouseOver={handleMouseOver}
                      // onMouseOut={handleMouseOut}
                      label={({ dataEntry }) => {
                        const percentage = new Decimal(dataEntry.value)
                          .div(formatToDecimal(totalRewards))
                          .mul(100)
                          .toNumber();
                        if (percentage < 5) {
                          return "";
                        }
                        return `${dataEntry.value} MEA`;
                      }}
                      labelPosition={50} // Controls how far from the center the label appears
                      labelStyle={{
                        fontSize: "5px",
                        fill: "#fff", // Text color
                        pointerEvents: "none", // Prevent text from capturing mouse events
                      }}
                    /> */}
                    <ul className="w-full flex flex-col gap-5">
                      <li>
                        <h4 className="text-base font-semibold text-white">
                          Direct Bonus
                        </h4>
                        <h3 className="text-[32px] text-white font-bold font-dm-sans leading-tight">
                          {formatBalance(crewProfit.direct)} {splToken.symbol}
                        </h3>
                      </li>
                      <li>
                        <h4 className="text-base font-semibold text-white">
                          Active Bonus
                        </h4>
                        <h3 className="text-[32px] text-white font-bold font-dm-sans leading-tight">
                          {formatBalance(crewProfit.active)} {splToken.symbol}
                        </h3>
                      </li>
                      <li>
                        <h4 className="text-base font-semibold text-white">
                          Deep Bonus
                        </h4>
                        <h3 className="text-[32px] text-white font-bold font-dm-sans leading-tight">
                          {formatBalance(crewProfit.deep)} {splToken.symbol}
                        </h3>
                      </li>
                    </ul>
                  </div>
                  {/* {tooltip.visible && (
                    <div
                      style={{
                        position: "absolute",
                        top: tooltip.y,
                        left: tooltip.x,
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        color: "white",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        pointerEvents: "none",
                        transform: "translate(-50%, -100%)", // Adjust tooltip position
                        whiteSpace: "now  rap",
                      }}
                    >
                      <strong>{tooltip.data}</strong>
                    </div>
                  )} */}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full bg-xl-gradient absolute h-[185px] z-10 -bottom-1"></div>
        </section>

        <ModalSuccess
          description={modalData.description}
          title={modalData.title}
          show={modalData.show && modalData.type == "success"}
          onClose={() => {
            setModalData({
              ...modalData,
              show: false,
            });
          }}
        />
        <ModelFailure
          description={modalData.description}
          title={modalData.title}
          onClose={() => {
            setModalData({
              ...modalData,
              show: false,
            });
          }}
          show={modalData.show && modalData.type == "error"}
        />
      </div>
    </>
  );
};

export default Dashboard;
