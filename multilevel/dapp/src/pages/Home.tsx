import { Helmet } from "react-helmet-async";
import { ConcentrixChart } from "../components/ConcentrixChart";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  getJoinTransaction,
  getUpgradeTransaction,
  isValidPublicKey,
} from "../utils/web3";
import { PlanID } from "../enums/plan";
import { PublicKey, SendTransactionError } from "@solana/web3.js";
import { useSelector } from "react-redux";
import { IRootState } from "../app/store";
// import { UserData } from "../schema/user_data";
import { AppStore } from "../schema/app_store";
import { AppState } from "../schema/app_state";
import {
  formatBalance,
  generateReferralCode,
  getClipBoardText,
} from "../utils/utils";
import { splToken } from "../utils/constants";
import { userJoined } from "../network/api";
import ModalSuccess from "../components/models/ModelSuccess";
import ModelFailure from "../components/models/ModelFailure";
import Decimal from "decimal.js";
import { UserData } from "../schema/user_data";
import BonusPie from "../components/BonusPie";
import { useSearchParams } from "react-router-dom";

const Home = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [inviteCode, setInvideCode] = useState("");
  const [pieChartSelected, setPieChartSelected] = useState(false);
  const userDataRaw = useSelector((state: IRootState) => state.user.data);
  const [searchParams] = useSearchParams();
  // Get a specific query parameter
  // Use useMemo to memoize the result of UserData.fromJSON
  const userData = useMemo(() => {
    return UserData.fromJSON(userDataRaw);
  }, [userDataRaw]); // Only recompute when userData changes

  const [modalData, setModalData] = useState({
    title: "",
    description: "",
    type: "",
    show: true,
  });

  const userPDAExists = useSelector(
    (state: IRootState) => state.user.dataAccExists
  );
  const appStoreRaw = useSelector((state: IRootState) => state.global.store);
  const appStateRaw = useSelector((state: IRootState) => state.global.state);
  const userBalance = useSelector(
    (state: IRootState) => new Decimal(state.user.tokenBalance)
  );

  const appStore = useMemo(() => {
    return AppStore.fromJSON(appStoreRaw);
  }, [appStoreRaw]);

  const appState = useMemo(() => {
    return AppState.fromJSON(appStateRaw);
  }, [appStateRaw]);

  const [selectedPlan, setSelectedPlan] = useState(PlanID.A);
  const [txLoading, setTxLoading] = useState(false);

  function handlePlanSwitch(planId: PlanID) {
    setSelectedPlan(planId);
  }

  const upgrade = async () => {
    try {
      setTxLoading(true);
      if (!publicKey) return;
      if (selectedPlan < userData.plan_id) {
        setModalData({
          title: "Downgrade isn't possible",
          description: `Cannot downgrade plan`,
          show: true,
          type: "error",
        });
        return;
      }
      if (
        userBalance.lessThan(
          appState
            .getPlan(selectedPlan)!
            .investment_required.sub(
              appState.getPlan(userData.plan_id)!.investment_required
            )
        )
      ) {
        setModalData({
          title: "Insufficient Balance",
          description: ``,
          show: true,
          type: "error",
        });
        return;
      }
      const tx = getUpgradeTransaction(publicKey, selectedPlan);

      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      await sendTransaction(tx, connection);
      userJoined(publicKey);
    } catch (error) {
      if (error instanceof SendTransactionError) {
        console.log(await error.getLogs(connection));
      }
      console.log(error);
    } finally {
      setTxLoading(false);
    }
  };
  const parseReferrerInput = useCallback(
    (code = inviteCode, showModal = true) => {
      if (!code) {
        //referral code is required
        if (showModal) {
          setModalData({
            title: "Invalid Invite Code",
            description: "Enter valid invite code or address",
            show: true,
            type: "error",
          });
        }
        return undefined;
      }
      if (!isValidPublicKey(code)) {
        const parsedAddress = appStore.referral_id_map.get(code);
        if (!parsedAddress) {
          //invalid invite code
          if (showModal) {
            setModalData({
              title: "Invalid Invite Code",
              description: "Enter valid invite code or address",
              show: true,
              type: "error",
            });
          }
          return undefined;
        }
        return parsedAddress;
      }
      return new PublicKey(code);
    },
    [appStore.referral_id_map, inviteCode]
  );

  const enroll = async () => {
    try {
      setTxLoading(true);
      if (!publicKey) return;
      const referrerAddress = parseReferrerInput();
      if (!referrerAddress) return;
      const tx = getJoinTransaction(
        publicKey,
        referrerAddress,
        selectedPlan,
        generateReferralCode(appStore.referral_id_map)
      );
      if (
        userBalance.lessThan(
          appState.getPlan(selectedPlan)!.investment_required
        )
      ) {
        setModalData({
          title: "Insufficient Balance",
          description: ``,
          show: true,
          type: "error",
        });
        return;
      }
      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      await sendTransaction(tx, connection);
      userJoined(publicKey);
      setModalData({
        title: "Transaction Success",
        description: "Plan Enrollment Successful",
        show: true,
        type: "success",
      });
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

  const handleEnrollClick = () => {
    if (!publicKey) {
      setModalData({
        title: "Not Connected",
        description: "Please connect your wallet",
        show: true,
        type: "error",
      });
      return;
    }
    if (userPDAExists) {
      //check whethere user can upgrade
      upgrade();
    } else {
      enroll();
    }
  };

  const [isTallScreen, setIsTallScreen] = useState(false);

  useEffect(() => {
    const checkHeight = () => {
      setIsTallScreen(window.innerHeight > 750);
    };

    checkHeight(); // Run initially
    window.addEventListener("resize", checkHeight);

    return () => window.removeEventListener("resize", checkHeight);
  }, []);

  const getReferralFromClipboard = useCallback(async () => {
    const text = await getClipBoardText();
    if (text != null) {
      if (parseReferrerInput(text, false)) {
        setInvideCode(text);
      }
    }
  }, [parseReferrerInput]);
  useEffect(() => {
    getReferralFromClipboard();
  }, []);

  useEffect(() => {
    const referrer = searchParams.get("r");
    if (referrer && parseReferrerInput(referrer, false)) {
      setInvideCode(referrer);
    }
    console.log("called2");
  }, [searchParams, parseReferrerInput]);
  return (
    <>
      <Helmet>
        <title>Home</title>
        <meta property="og:title" content="A very important title" />
      </Helmet>
      <div className="w-full">
        <section className="w-full bg-black5 relative md:min-h-[600px] lg:h-[90vh] pt-32 lg:pt-[240px]">
          <video
            src="/assets/how-bg.mp4"
            className="w-screen top-0 left-0 bg-cover z-0 object-cover h-screen absolute"
            loop
            muted
            autoPlay
          ></video>
          <div className="w-full h-screen absolute top-0 left-0 bg-black5/50"></div>
          {/* End TeamBee Changes */}
          <div className="w-full max-w-[1152px] mx-auto px-5 relative z-20">
            <div className="w-full text-center">
              <div className="inline-flex items-center justify-center">
                <img
                  src="Mecca-Purple-Logo.png"
                  className="lg:w-fit w-[125.57px]"
                  alt=""
                />
                <h1 className="text-center font-dm-sans font-black text-[32px] lg:text-[100px] text-white uppercase">
                  CRYPTO
                </h1>
              </div>
              <p className="text-base leading-6 font-semibold text-white max-w-[944px] mx-auto mt-2">
                MECCA Crypto is an innovative platform designed to provide
                ecosystem participants with unlimited and perpetual monetization
                opportunities.The space combines blockchain technology with a
                sponsorship reward system to help participants gain sustainable
                value in a transparent and fair manner. Experience a new
                blockchain-based economic model with MECCA Crypto today and
                explore a world of endless possibilities.
              </p>
            </div>
          </div>
          <div className="w-full bg-xl-gradient absolute h-[185px] z-10 bottom-0"></div>
        </section>

        <section className="w-full bg-[url(abstract-design-bg.png)] relative md:pt-0 pt-28 bg-black4 bg-cover bg-no-repeat bg-center pb-[161px] min-h-[671px]">
          <div className="w-full max-w-[1152px] mx-auto px-5">
            {/* removed :  md:-translate-y-36 */}
            <div
              className={`w-full grid grid-cols-1 lg:grid-cols-2 gap-[60px] ${
                isTallScreen ? "md:-translate-y-36" : ""
              } relative z-10`}
            >
              <div className="w-full md:px-9 px-4 md:py-7 py-6 backdrop-blur-md bg-[url(stage-b-bg.png)] bg-full bg-center bg-no-repeat h-[690px]">
                <ul className="flex items-center md:gap-4 gap-2">
                  <li>
                    <button
                      type="button"
                      onClick={() => handlePlanSwitch(PlanID.A)}
                      style={{
                        background: "rgba(210, 8, 252, 0.05)",
                      }}
                      className={`${
                        selectedPlan === PlanID.A ? "selected" : ""
                      } md:text-xs text-[10px] md:h-9 text-center disabled:text-gray1 text-white font-semibold inline-flex items-center justify-center uppercase`}
                    >
                      <svg
                        width={95}
                        height={50}
                        className="text-green2"
                        viewBox="0 0 79 35"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.25 6.23757C0.25 5.86981 0.365861 5.51139 0.581132 5.21321L3.64047 0.975639C3.96946 0.519947 4.4973 0.25 5.05934 0.25H77C77.9665 0.25 78.75 1.0335 78.75 2V28.4674C78.75 28.8564 78.6204 29.2344 78.3816 29.5415L75.3667 33.4192C75.0351 33.8456 74.5253 34.0951 73.9851 34.0951H2C1.0335 34.0951 0.25 33.3116 0.25 32.3451V6.23757Z"
                          fill={
                            selectedPlan === PlanID.A
                              ? "url(#paint0_linear_183_463)"
                              : ""
                          }
                          strokeWidth={selectedPlan === PlanID.A ? "0.5" : "1"}
                          stroke="#D107FB"
                        />
                      </svg>
                      <span className="absolute">STAGE - A</span>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handlePlanSwitch(PlanID.B)}
                      style={{
                        background: "rgba(210, 8, 252, 0.05)",
                      }}
                      className={`${
                        selectedPlan === PlanID.B ? "selected" : ""
                      } md:text-xs text-[10px] md:h-9 text-center disabled:text-gray1 text-white font-semibold inline-flex items-center justify-center uppercase`}
                    >
                      <svg
                        width={95}
                        height={50}
                        viewBox="0 0 79 35"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.25 6.23757C0.25 5.86981 0.365861 5.51139 0.581132 5.21321L3.64047 0.975639C3.96946 0.519947 4.4973 0.25 5.05934 0.25H77C77.9665 0.25 78.75 1.0335 78.75 2V28.4674C78.75 28.8564 78.6204 29.2344 78.3816 29.5415L75.3667 33.4192C75.0351 33.8456 74.5253 34.0951 73.9851 34.0951H2C1.0335 34.0951 0.25 33.3116 0.25 32.3451V6.23757Z"
                          fill={
                            selectedPlan === PlanID.B
                              ? "url(#paint0_linear_183_463)"
                              : ""
                          }
                          strokeWidth={selectedPlan === PlanID.B ? "0.5" : "1"}
                          stroke="#D107FB"
                        />
                        <defs>
                          <linearGradient
                            id="paint0_linear_183_463"
                            x1="-12.5"
                            y1={-3}
                            x2="92.5"
                            y2={38}
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop offset="0.0389999" stopColor="#7C0495" />
                            <stop offset="0.234" stopColor="#D107FB" />
                            <stop offset="0.49" stopColor="#ED95FF" />
                            <stop offset="0.739" stopColor="#D107FB" />
                            <stop offset="0.969" stopColor="#7C0495" />
                          </linearGradient>
                        </defs>
                      </svg>

                      <span className="absolute">STAGE - B</span>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      style={{
                        background: "rgba(210, 8, 252, 0.05)",
                      }}
                      onClick={() => handlePlanSwitch(PlanID.C)}
                      className={`${
                        selectedPlan === PlanID.C ? "selected" : ""
                      } md:text-xs text-[10px] md:h-9 text-center disabled:text-gray1 text-white font-semibold inline-flex items-center justify-center uppercase`}
                    >
                      <svg
                        width={95}
                        height={50}
                        viewBox="0 0 79 35"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.5 6.23757C0.5 5.92234 0.59931 5.61513 0.783827 5.35955L0.379884 5.06792L0.783827 5.35955L3.84317 1.12198C4.12516 0.731383 4.57759 0.5 5.05934 0.5H77C77.8284 0.5 78.5 1.17157 78.5 2V28.4674C78.5 28.8008 78.3889 29.1248 78.1842 29.3881L75.1693 33.2658C74.8851 33.6313 74.4481 33.8451 73.9851 33.8451H2C1.17157 33.8451 0.5 33.1735 0.5 32.3451V6.23757Z"
                          fill={
                            selectedPlan === PlanID.C
                              ? "url(#paint0_linear_183_463)"
                              : ""
                          }
                          strokeWidth={selectedPlan === PlanID.B ? "0.5" : "1"}
                          stroke="#D107FB"
                        />
                      </svg>

                      <span className="absolute">STAGE - C</span>
                    </button>
                  </li>
                </ul>

                <div className="w-full">
                  <h5 className="text-magenta1 text-xs font-semibold my-3 uppercase">
                    STAGE -{" "}
                    {String.fromCharCode(
                      65 + parseInt(selectedPlan.toString())
                    )}
                  </h5>
                  <h2 className="text-2xl text-white font-semibold mb-5">
                    PARTICIPATION FEE :{" "}
                    {formatBalance(
                      appState.getPlan(selectedPlan)!.investment_required
                    )}{" "}
                    {splToken.symbol}
                  </h2>

                  <form className="w-full" id="Invite-Form">
                    <div className="w-full">
                      <label
                        htmlFor="Invite"
                        className="text-xs text-white mb-2 block"
                      >
                        Invite Code or Address
                      </label>
                      <input
                        name="Invite-Code"
                        id="Invite"
                        type="text"
                        value={inviteCode}
                        onChange={(e) => {
                          setInvideCode(e.target.value);
                        }}
                        placeholder="Enter the Invite code or Address"
                        className="bg-black1 text-xs rounded border border-black2 w-full py-2.5 px-3 placeholder:text-gray1 text-white"
                      />
                    </div>
                    <button
                      type="button"
                      className="min-h-button text-base relative flex items-center justify-center text-center w-full mt-6 uppercase text-white font-semibold"
                      onClick={handleEnrollClick}
                      disabled={
                        (userPDAExists && selectedPlan <= userData.plan_id) ||
                        !inviteCode
                      }
                    >
                      <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 426 45"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0 8.5C0 7.9 0.17 7.4 0.47 7L4.9 1.5C5.28 1 5.84 0.7 6.43 0.7H424C425.1 0.7 426 1.6 426 2.7V38C426 38.5 425.86 39 425.6 39.4L422.1 44C421.72 44.5 421.13 44.8 420.5 44.8H2C0.9 44.8 0 43.9 0 42.8V8.5Z"
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
                        <span>{userPDAExists ? "Upgrade" : "Join"}</span>
                      </span>
                    </button>
                  </form>

                  <div className="w-full">
                    <h4 className="text-white font-bold text-base mt-5 mb-3">
                      DEPOSIT GUIDE
                    </h4>
                    <ul className="text-gray3 list-disc pl-6">
                      <li>
                        <p className="text-gray3 text-sm font-normal">
                          Enter your Solana Wallet address, which is the
                          invitee, in the designated field.
                        </p>
                      </li>
                      <li>
                        <p className="text-gray3 text-sm font-normal">
                          Make sure your Solana wallet is connected and ready to
                          trade.
                        </p>
                      </li>
                      <li>
                        <p className="text-gray3 text-sm font-normal">
                          Enter the invitee's unique code and Solana address to
                          confirm.
                        </p>
                      </li>
                      <li>
                        <p className="text-gray3 text-sm font-normal">
                          Click the "Make a Deposit" button to start the final
                          stage process.
                        </p>
                      </li>

                      <li>
                        <p className="text-gray3 text-sm font-normal">
                          The bonus pool will incur a daily fee of 1 MEA
                          (deduction)
                        </p>
                      </li>
                      <li>
                        <p className="text-gray3 text-sm font-normal">
                          If you want to receive an invitation code , please
                          contact us <br />
                          <b>meccacrew@gmail.com</b>
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="w-full md:px-9 px-4 md:py-7 py-6 backdrop-blur-md bg-[url(stage-b-bg.png)] bg-full bg-center bg-no-repeat h-[690px]">
                {!pieChartSelected && (
                  <ConcentrixChart plan_id={selectedPlan} />
                )}
                {pieChartSelected && <BonusPie plan_id={selectedPlan} />}
                <button
                  className="p-2.5 rounded-md absolute top-4 right-4"
                  onClick={() => {
                    setPieChartSelected(!pieChartSelected);
                  }}
                >
                  <img
                    src="/assets/arrow-icon.png"
                    className="absolute"
                    alt=""
                    style={{
                      top: "15px",
                      left: "15px",
                    }}
                  />
                  <svg
                    width={35}
                    height={35}
                    viewBox="0 0 60 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 0 H59 V49 L49 59 H0 V10 Z"
                      // d="M10 0 H78 V68 L68 78 H0 V10 Z"
                      // d="M0.5 6.23757C0.5 5.92234 0.59931 5.61513 0.783827 5.35955L0.379884 5.06792L0.783827 5.35955L3.84317 1.12198C4.12516 0.731383 4.57759 0.5 5.05934 0.5H77C77.8284 0.5 78.5 1.17157 78.5 2V28.4674C78.5 28.8008 78.3889 29.1248 78.1842 29.3881L75.1693 33.2658C74.8851 33.6313 74.4481 33.8451 73.9851 33.8451H2C1.17157 33.8451 0.5 33.1735 0.5 32.3451V6.23757Z"
                      strokeWidth={"2"}
                      stroke="#D107FB"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
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
        </section>
      </div>
    </>
  );
};

export default Home;
