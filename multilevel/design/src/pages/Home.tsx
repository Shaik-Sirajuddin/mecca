import { Helmet } from "react-helmet-async";
import { ConcentrixChart } from "../components/ConcentrixChart";
import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AppState } from "../schema/app_state";
import { UserData } from "../schema/user_data";
import { getJoinTransaction, getUpgradeTransaction } from "../utils/web3";
import { PlanID } from "../enums/plan";
import { SendTransactionError } from "@solana/web3.js";

const chartData = [
  {
    chart: [
      { title: "Level 10-20", level: "10%", stage: "STAGE - A REVENUE" },
      { title: "Level 30-50", level: "30%", stage: "STAGE - A REVENUE" },
      { title: "Level 50-70", level: "70%", stage: "STAGE - A REVENUE" },
    ],
  },
  {
    stage: "STAGE - B REVENUE",
    chart: [
      { title: "Level 10-20", level: "10%", stage: "STAGE - A REVENUE" },
      { title: "Level 30-50", level: "30%", stage: "STAGE - A REVENUE" },
      { title: "Level 50-70", level: "70%", stage: "STAGE - A REVENUE" },
    ],
  },
  {
    stage: "STAGE - C REVENUE",
    chart: [
      { title: "Level 10-20", level: "10%", stage: "STAGE - A REVENUE" },
      { title: "Level 30-50", level: "30%", stage: "STAGE - A REVENUE" },
      { title: "Level 50-70", level: "70%", stage: "STAGE - A REVENUE" },
    ],
  },
];

const Home = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [userData, setUserData] = useState<UserData>(UserData.dummy());
  const [appState, setAppState] = useState<AppState>(AppState.dummy());

  const [StageTabs, setStageTabs] = useState("state-a");
  let chartIndex = 0;

  function handleTab(tab: string) {
    setStageTabs(tab);
  }

  switch (StageTabs) {
    case "state-a":
      chartIndex = 0;
      break;
    case "state-b":
      chartIndex = 1;
      break;
    case "state-c":
      chartIndex = 2;
      break;
  }

  const upgrade = async () => {
    try {
      if (!publicKey) return;
      const tx = getUpgradeTransaction(publicKey, PlanID.B);

      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      const signedTx = await signTransaction!(tx);
      const broadcastResponse = await connection.sendRawTransaction(
        signedTx.serialize()
      );
      console.log(broadcastResponse);
    } catch (error) {
      if (error instanceof SendTransactionError) {
        console.log(await error.getLogs(connection));
      }
      console.log(error);
    }
  };

  const enroll = async () => {
    try {
      if (!publicKey) return;
      const tx = getJoinTransaction(
        publicKey,
        publicKey,
        PlanID.A,
        "MC00000001"
      );

      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      const signedTx = await signTransaction!(tx);
      const broadcastResponse = await connection.sendRawTransaction(
        signedTx.serialize()
      );
      console.log(broadcastResponse);
    } catch (error) {
      if (error instanceof SendTransactionError) {
        console.log(await error.getLogs(connection));
      }
      console.log(error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Home</title>
        <meta property="og:title" content="A very important title" />
      </Helmet>
      <div className="w-full">
        <section className="w-full relative md:min-h-[600px] lg:min-h-[853px] bg-[url(mecca-banner-bg.png)] bg-cover bg-center bg-no-repeat pt-32 lg:pt-[240px]">
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
                MECA Crypto is an innovative platform designed to provide
                ecosystem participants with unlimited and perpetual monetization
                opportunities.The space combines blockchain technology with a
                sponsorship reward system to help participants gain sustainable
                value in a transparent and fair manner. Experience a new
                blockchain-based economic model with MECA Crypto today and
                explore a world of endless possibilities.
              </p>
            </div>
          </div>
          <div className="w-full bg-xl-gradient absolute h-[185px] z-10 bottom-0"></div>
        </section>

        <section className="w-full bg-[url(abstract-design-bg.png)] relative md:pt-0 pt-28 bg-black4 bg-cover bg-no-repeat bg-center pb-[161px] min-h-[671px]">
          <div className="w-full max-w-[1152px] mx-auto px-5">
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-[60px] md:-translate-y-36 relative z-10">
              <div className="w-full md:px-9 px-4 md:py-7 py-6 backdrop-blur-md bg-[url(stage-b-bg.png)] bg-full bg-center bg-no-repeat h-[650px]">
                <ul className="flex items-center md:gap-4 gap-2">
                  <li>
                    <button
                      onClick={() => handleTab("state-a")}
                      className="md:text-xs text-[10px] md:h-9 text-center disabled:text-gray1 text-white font-semibold inline-flex items-center justify-center uppercase"
                    >
                      <svg
                        width={79}
                        height={35}
                        className="text-green2"
                        viewBox="0 0 79 35"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0 6.23757C0 5.81727 0.132413 5.40765 0.378437 5.06687L3.43778 0.829302C3.81377 0.308511 4.41701 0 5.05934 0H77C78.1046 0 79 0.895431 79 2V28.4674C79 28.912 78.8518 29.3439 78.5789 29.695L75.564 33.5727C75.1851 34.06 74.6024 34.3451 73.9851 34.3451H2C0.895429 34.3451 0 33.4496 0 32.3451V6.23757Z"
                          fill="currentColor"
                        />
                      </svg>
                      <span className="absolute">STAGE - A</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleTab("state-b")}
                      className="md:text-xs text-[10px] md:h-9 text-center disabled:text-gray1 text-white font-semibold inline-flex items-center justify-center uppercase"
                    >
                      <svg
                        width={79}
                        height={35}
                        viewBox="0 0 79 35"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.25 6.23757C0.25 5.86981 0.365861 5.51139 0.581132 5.21321L3.64047 0.975639C3.96946 0.519947 4.4973 0.25 5.05934 0.25H77C77.9665 0.25 78.75 1.0335 78.75 2V28.4674C78.75 28.8564 78.6204 29.2344 78.3816 29.5415L75.3667 33.4192C75.0351 33.8456 74.5253 34.0951 73.9851 34.0951H2C1.0335 34.0951 0.25 33.3116 0.25 32.3451V6.23757Z"
                          fill="url(#paint0_linear_183_463)"
                          stroke="#D107FB"
                          strokeWidth="0.5"
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
                      onClick={() => handleTab("state-c")}
                      className="md:text-xs text-[10px] md:h-9 text-center disabled:text-gray1 text-white font-semibold inline-flex items-center justify-center uppercase"
                    >
                      <svg
                        width={79}
                        height={35}
                        viewBox="0 0 79 35"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.5 6.23757C0.5 5.92234 0.59931 5.61513 0.783827 5.35955L0.379884 5.06792L0.783827 5.35955L3.84317 1.12198C4.12516 0.731383 4.57759 0.5 5.05934 0.5H77C77.8284 0.5 78.5 1.17157 78.5 2V28.4674C78.5 28.8008 78.3889 29.1248 78.1842 29.3881L75.1693 33.2658C74.8851 33.6313 74.4481 33.8451 73.9851 33.8451H2C1.17157 33.8451 0.5 33.1735 0.5 32.3451V6.23757Z"
                          fill="#38383E"
                          stroke="white"
                        />
                      </svg>

                      <span className="absolute">STAGE - C</span>
                    </button>
                  </li>
                </ul>

                <div className="w-full">
                  <h5 className="text-magenta1 text-xs font-semibold my-3 uppercase">
                    STAGE -{" "}
                    {StageTabs === "state-a"
                      ? "A"
                      : StageTabs === "state-b"
                      ? "B"
                      : "C"}
                  </h5>
                  <h2 className="text-2xl text-white font-semibold mb-5">
                    PARTICIPATION FEE :{" "}
                    {StageTabs === "state-a"
                      ? "10,000 MEA"
                      : StageTabs === "state-b"
                      ? "20,000 MEA"
                      : "30,000 MEA"}
                  </h2>

                  <form className="w-full" id="Invite-Form">
                    <div className="w-full">
                      <label
                        htmlFor="Invite"
                        className="text-xs text-white mb-2 block"
                      >
                        Invite-in Code*
                      </label>
                      <input
                        name="Invite-Code"
                        id="Invite"
                        type="text"
                        placeholder="Enter the Invite- in code"
                        className="bg-black1 text-xs rounded border border-black2 w-full py-2.5 px-3 placeholder:text-gray1 text-white"
                      />
                    </div>
                    <span className="text-xs uppercase text-white my-3 text-center mx-auto w-full block">
                      OR
                    </span>
                    <div className="w-full">
                      <label
                        htmlFor="Invitation-Address"
                        className="text-xs text-white mb-2 block"
                      >
                        Invitation Address*
                      </label>
                      <input
                        name="Invitation-Address"
                        id="Invitation-Address"
                        type="text"
                        placeholder="Enter the Invitation Address"
                        className="bg-black1 text-xs rounded border border-black2 w-full py-2.5 px-3 placeholder:text-gray1 text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="text-base relative flex items-center justify-center text-center w-full mt-6 uppercase text-white font-semibold"
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

                      <span className="absolute">JOIN & UPDATE</span>
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
                    </ul>
                  </div>
                </div>
              </div>
              <div className="w-full md:px-9 px-4 md:py-7 py-6 backdrop-blur-md bg-[url(stage-b-bg.png)] bg-full bg-center bg-no-repeat h-[650px]">
                <ConcentrixChart
                  chartData={{
                    ...chartData[chartIndex].chart[0],
                  }}
                  stage=""
                />

                <div className="w-full">
                  <h4 className="text-white font-bold text-base mt-5 mb-3">
                    NOTICE
                  </h4>
                  <ul className="text-gray3 list-disc pl-6">
                    <li>
                      <p className="text-gray3 text-sm font-normal">
                        The bonus pool will incur a daily fee of -1$MEA
                      </p>
                    </li>
                    <li>
                      <p className="text-gray3 text-sm font-normal">
                        If your tokens in the bonus pool reach "0 $MEA", you
                        will no longer be able to receive invitation rewards.
                      </p>
                    </li>
                    <li>
                      <p className="text-gray3 text-sm font-normal">
                        If you don't have enough funds in the bonus pool, fill
                        it up.
                      </p>
                    </li>
                    <li>
                      <p className="text-gray3 text-sm font-normal">
                        If you leave the "0" limit, you will receive the reward
                        again.
                      </p>
                    </li>
                    <li>
                      <p className="text-gray3 text-sm font-normal">
                        The minimum amount to be filled in the bonus pool is 1
                        $MEA.
                      </p>
                    </li>
                    <li>
                      <p className="text-gray3 text-sm font-normal">
                        After the first stage, bonuses will not be given for
                        stage updates and additional deposits of lower users.
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
