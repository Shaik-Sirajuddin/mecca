import { Helmet } from "react-helmet-async";
import { UserStore } from "../schema/user_store";
import { useSelector } from "react-redux";
import { useMemo } from "react";
import { IRootState } from "../app/store";
import { formatBalance, shortenAddress } from "../utils/utils";
import { splToken } from "../utils/constants";
import { AppStore } from "../schema/app_store";
import { PublicKey } from "@solana/web3.js";
import { UserData } from "../schema/user_data";

const Crew = () => {
  const userStoreRaw = useSelector((state: IRootState) => state.user.store);
  const userStore = useMemo(() => {
    return UserStore.fromJSON(userStoreRaw);
  }, [userStoreRaw]);

  const appStoreRaw = useSelector((state: IRootState) => state.global.store);

  const appStore = useMemo(() => {
    return AppStore.fromJSON(appStoreRaw);
  }, [appStoreRaw]);

  const getUserCode = (
    user: PublicKey,
    referralMap: Map<string, PublicKey>
  ) => {
    for (const [key, value] of referralMap) {
      if (value.equals(user)) {
        return key;
      }
    }
    return "";
  };

  return (
    <>
      <Helmet>
        <title>Mecca || Crew</title>
        <meta property="og:title" content="A very important title" />
      </Helmet>

      <div className="w-full bg-black5 relative">
        <div className="w-full max-w-[1162px] mx-auto absolute h-[623px] rounded-full blur-[200px] -top-[400px] left-1/2 -translate-x-1/2 bg-[#6E3359]"></div>

        <section className="w-full relative md:min-h-[600px] lg:min-h-[753px]  pb-28 pt-32 lg:pt-[254px]">
          <div className="w-full h-screen absolute top-0 left-0 bg-black5/50 z-10"></div>
          <video
            src="/assets/dashboard.bg.mp4"
            className="w-screen top-0 left-0 bg-cover object-cover h-screen absolute"
            loop
            muted
            autoPlay
          ></video>
          <div className="w-full bg-xl-gradient top-[80vh] absolute h-[185px] z-10 -bottom-1"></div>
          {/*End TeamBee Changes  */}
          <div className="w-full max-w-[1152px] mx-auto px-5 relative z-20">
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
                CREW
              </h1>
              <p className="text-2xl uppercase font-semibold leading-6 mb-1 text-white max-w-[974px] mx-auto mt-2">
                TOTAL CREW
              </p>
              <h4 className="md:text-[40px] text-2xl text-magenta1 font-bold font-dm-sans tracking-normal uppercase ">
                {userStore.rewards.length}
              </h4>
              <div className="max-w-[596px] grid md:grid-cols-3 grid-cols-1 w-full mx-auto">
                <div className="">
                  <p className="md:text-2xl text-base font-semibold text-white uppercasep mt-7">
                    DIRECT CREW
                  </p>
                  <h4 className="md:text-[40px] text-2xl font-bold font-dm-sans text-magenta1 leading-tight">
                    {userStore.getCrewCount().direct}
                  </h4>
                </div>
                <div className="">
                  <p className="md:text-2xl text-base font-semibold text-white uppercasep mt-7">
                    ACTIVE CREW
                  </p>
                  <h4 className="md:text-[40px] text-2xl font-bold font-dm-sans text-magenta1 leading-tight">
                    {userStore.getCrewCount().active}
                  </h4>
                </div>
                <div className="">
                  <p className="md:text-2xl text-base font-semibold text-white uppercasep mt-7">
                    DEEP CREW
                  </p>
                  <h4 className="md:text-[40px] text-2xl font-bold font-dm-sans text-magenta1 leading-tight">
                    {userStore.getCrewCount().deep}
                  </h4>
                </div>
              </div>
            </div>
            <div className="w-full pt-[70px]">
              {/* <div className="max-w-[439.42px]">
                <form id="search-form" className="flex items-center gap-5 mb-5">
                  <div className="w-full">
                    <input
                      name={"seach"}
                      required
                      id={"search-input"}
                      type={"search"}
                      placeholder={"Search here"}
                      className={
                        "bg-black1 text-xs rounded border border-black2 w-full py-2.5 px-3 placeholder:text-gray1 text-white"
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    className={
                      "text-sm relative flex items-center justify-center text-center w-[84.42px] text-white font-semibold"
                    }
                  >
                    <svg  
                      width={85}
                      height={38}
                      viewBox="0 0 85 38"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0 7.31457C0 6.86542 0.1415 6.42769 0.404409 6.06353L3.67371 1.53513C4.0755 0.978595 4.72015 0.648911 5.40656 0.648911H82.2845C83.4649 0.648911 84.4218 1.60579 84.4218 2.78617V31.07C84.4218 31.5451 84.2635 32.0067 83.9718 32.3818L80.75 36.5257C80.3451 37.0465 79.7224 37.3511 79.0627 37.3511H2.13726C0.956888 37.3511 0 36.3942 0 35.2138V7.31457Z"
                        fill="#D107FB"
                      />
                    </svg>

                    <span className="absolute">Search</span>
                  </button>
                </form>
              </div> */}

              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[1100px] text-gray5 backdrop-blur-md">
                  <thead>
                    <tr>
                      <th className="text-magenta1 py-3.5 text-base font-poppins font-semibold px-2.5 border border-gray3">
                        S.No.
                      </th>
                      <th className="text-magenta1 py-3.5 text-base font-poppins font-semibold px-2.5 border border-gray3">
                        Unique No.
                      </th>
                      <th className="text-magenta1 py-3.5 text-base font-poppins font-semibold px-2.5 border border-gray3">
                        Wallet Address
                      </th>
                      <th className="text-magenta1 py-3.5 text-base font-poppins font-semibold px-2.5 border border-gray3">
                        Type
                      </th>
                      <th className="text-magenta1 py-3.5 text-base font-poppins font-semibold px-2.5 border border-gray3">
                        Level
                      </th>
                      <th className="text-magenta1 py-3.5 text-base font-poppins font-semibold px-2.5 border border-gray3">
                        Bonus
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userStore.rewards.map((item, index) => {
                      return (
                        <tr className="text-center">
                          <td
                            scope="row"
                            className="text-sm border text-gray5 border-gray3 py-3.5 font-poppins font-semibold px-2.5"
                          >
                            <p>{index + 1}</p>
                          </td>
                          <td className="text-sm border text-gray5 border-gray3 py-3.5 font-poppins font-semibold px-2.5">
                            <p>
                              this
                              {/* {getUserCode(item.user, appStore.referral_id_map)} */}
                            </p>
                          </td>
                          <td className="text-sm border text-gray5 border-gray3 py-3.5 font-poppins font-semibold px-2.5">
                            <p>{shortenAddress(item.from.toString())}</p>
                          </td>
                          <td className="text-xs border text-gray5 border-gray3 py-3.5 font-poppins font-semibold px-2.5">
                            <p className="bg-pink1 inline-block rounded py-1 px-1.5">
                              {UserData.getUserCrew(item.level)} CREW
                            </p>
                          </td>
                          <td className="text-sm border text-gray5 border-gray3 py-3.5 font-poppins font-semibold px-2.5">
                            <p>{item.level}</p>
                          </td>
                          <td className="text-sm border text-gray5 border-gray3 py-3.5 font-poppins font-semibold px-2.5">
                            <p>
                              {formatBalance(item.reward_amount)}{" "}
                              {splToken.symbol}
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="w-full bg-xl-gradient absolute h-[185px] z-10 -bottom-1"></div>
        </section>
      </div>
    </>
  );
};

export default Crew;
