import { useWallet } from "@solana/wallet-adapter-react";
import { Helmet } from "react-helmet-async";

const OrganizationChart = () => {
  const { publicKey } = useWallet();
  return (
    <>
      <Helmet>
        <title>Mecca || Organization Chart</title>
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
          <div className="w-full bg-xl-gradient top-[80vh] absolute h-[185px] z-10 -bottom-1"></div>{" "}
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
              <h1 className="text-[32px] lg:text-[94px] max-w-[710px] leading-tight mx-auto text-white font-dm-sans font-bold mb-16">
                ORGANIZATION CHART
              </h1>
            </div>

            {/* <div className="overflow-x-auto flex items-center">
              <div className="w-full max-w-[900px] min-w-[900px] mx-auto pt-[10px] flex flex-col items-center justify-center">
                <div className="w-full max-w-[234px] bg-[url(tree-chart-bg.png)] bg-no-repeat bg-full bg-center p-3 relative mb-12">
                  <ul>
                    <li className="w-full flex items-center gap-5 justify-between mb-2">
                      <p className="text-sm font-medium font-poppins text-white">
                        User ID
                      </p>
                      <p className="text-sm font-medium font-poppins text-white">
                        45jk201fg
                      </p>
                    </li>
                    <li className="w-full flex items-center gap-5 justify-between mb-2">
                      <p className="text-sm font-medium font-poppins text-white">
                        Wallet address :
                      </p>
                      <p className="text-sm font-medium font-poppins text-white">
                        45jk201fg
                      </p>
                    </li>
                    <li className="w-full flex items-center gap-5 justify-between mb-2">
                      <p className="text-sm font-medium font-poppins text-white">
                        Initial Stage :
                      </p>
                      <p className="text-xs font-medium font-poppins text-white bg-green1 p-1 rounded">
                        STAGE A
                      </p>
                    </li>
                    <li className="w-full flex items-center gap-5 justify-between mb-2">
                      <p className="text-sm font-medium font-poppins text-white">
                        Current Stage :
                      </p>
                      <p className="text-xs font-medium font-poppins text-white bg-pink1 p-1 rounded">
                        STAGE C
                      </p>
                    </li>
                    <li className="w-full flex items-center gap-5 justify-between">
                      <p className="text-sm font-medium font-poppins text-white">
                        Referral Reward :
                      </p>
                      <p className="text-sm font-medium font-poppins text-white">
                        10 MEA
                      </p>
                    </li>
                  </ul>
                  <img
                    src="tree-lines.png"
                    className="absolute -bottom-11 left-1/2 -translate-x-1/2 min-w-[431px] h-[45px]"
                    alt=""
                  />
                </div>
                <div className="w-full flex items-start justify-center gap-[100px] -mt-1">
                  <div className="relative flex items-center justify-center flex-col">
                    <div className="w-full max-w-[234px] bg-[url(tree-chart-bg.png)] bg-no-repeat bg-full bg-center p-3 relative mb-12">
                      <ul>
                        <li className="w-full flex items-center gap-5 justify-between mb-2">
                          <p className="text-sm font-medium font-poppins text-white">
                            User ID
                          </p>
                          <p className="text-sm font-medium font-poppins text-white">
                            45jk201fg
                          </p>
                        </li>
                        <li className="w-full flex items-center gap-5 justify-between mb-2">
                          <p className="text-sm font-medium font-poppins text-white">
                            Wallet address :
                          </p>
                          <p className="text-sm font-medium font-poppins text-white">
                            45jk201fg
                          </p>
                        </li>
                        <li className="w-full flex items-center gap-5 justify-between mb-2">
                          <p className="text-sm font-medium font-poppins text-white">
                            Initial Stage :
                          </p>
                          <p className="text-xs font-medium font-poppins text-white bg-green1 p-1 rounded">
                            STAGE A
                          </p>
                        </li>
                        <li className="w-full flex items-center gap-5 justify-between mb-2">
                          <p className="text-sm font-medium font-poppins text-white">
                            Current Stage :
                          </p>
                          <p className="text-xs font-medium font-poppins text-white bg-pink1 p-1 rounded">
                            STAGE C
                          </p>
                        </li>
                        <li className="w-full flex items-center gap-5 justify-between">
                          <p className="text-sm font-medium font-poppins text-white">
                            Referral Reward :
                          </p>
                          <p className="text-sm font-medium font-poppins text-white">
                            10 MEA
                          </p>
                        </li>
                      </ul>
                      <img
                        src="tree-lines-2.png"
                        className="absolute -bottom-11 left-1/2 -translate-x-1/2 min-w-[273px] h-[45px]"
                        alt=""
                      />
                    </div>

                    <div className="flex items-center gap-10 -mt-1">
                      <div className="w-full max-w-[234px] bg-[url(tree-chart-bg.png)] bg-no-repeat bg-full bg-center p-3 relative mb-12">
                        <ul>
                          <li className="w-full flex items-center gap-5 justify-between mb-2">
                            <p className="text-sm font-medium font-poppins text-white">
                              User ID
                            </p>
                            <p className="text-sm font-medium font-poppins text-white">
                              45jk201fg
                            </p>
                          </li>
                          <li className="w-full flex items-center gap-5 justify-between mb-2">
                            <p className="text-sm font-medium font-poppins text-white">
                              Wallet address :
                            </p>
                            <p className="text-sm font-medium font-poppins text-white">
                              45jk201fg
                            </p>
                          </li>
                          <li className="w-full flex items-center gap-5 justify-between mb-2">
                            <p className="text-sm font-medium font-poppins text-white">
                              Initial Stage :
                            </p>
                            <p className="text-xs font-medium font-poppins text-white bg-green1 p-1 rounded">
                              STAGE A
                            </p>
                          </li>
                          <li className="w-full flex items-center gap-5 justify-between mb-2">
                            <p className="text-sm font-medium font-poppins text-white">
                              Current Stage :
                            </p>
                            <p className="text-xs font-medium font-poppins text-white bg-pink1 p-1 rounded">
                              STAGE C
                            </p>
                          </li>
                          <li className="w-full flex items-center gap-5 justify-between">
                            <p className="text-sm font-medium font-poppins text-white">
                              Referral Reward :
                            </p>
                            <p className="text-sm font-medium font-poppins text-white">
                              10 MEA
                            </p>
                          </li>
                        </ul>
                      </div>
                      <div className="w-full max-w-[234px] bg-[url(tree-chart-bg.png)] bg-no-repeat bg-full bg-center p-3 relative mb-12">
                        <ul>
                          <li className="w-full flex items-center gap-5 justify-between mb-2">
                            <p className="text-sm font-medium font-poppins text-white">
                              User ID
                            </p>
                            <p className="text-sm font-medium font-poppins text-white">
                              45jk201fg
                            </p>
                          </li>
                          <li className="w-full flex items-center gap-5 justify-between mb-2">
                            <p className="text-sm font-medium font-poppins text-white">
                              Wallet address :
                            </p>
                            <p className="text-sm font-medium font-poppins text-white">
                              45jk201fg
                            </p>
                          </li>
                          <li className="w-full flex items-center gap-5 justify-between mb-2">
                            <p className="text-sm font-medium font-poppins text-white">
                              Initial Stage :
                            </p>
                            <p className="text-xs font-medium font-poppins text-white bg-green1 p-1 rounded">
                              STAGE A
                            </p>
                          </li>
                          <li className="w-full flex items-center gap-5 justify-between mb-2">
                            <p className="text-sm font-medium font-poppins text-white">
                              Current Stage :
                            </p>
                            <p className="text-xs font-medium font-poppins text-white bg-pink1 p-1 rounded">
                              STAGE C
                            </p>
                          </li>
                          <li className="w-full flex items-center gap-5 justify-between">
                            <p className="text-sm font-medium font-poppins text-white">
                              Referral Reward :
                            </p>
                            <p className="text-sm font-medium font-poppins text-white">
                              10 MEA
                            </p>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="relative w-1/3">
                    <div className="w-full max-w-[234px] bg-[url(tree-chart-bg.png)] bg-no-repeat bg-full bg-center p-3 relative mb-12">
                      <ul>
                        <li className="w-full flex items-center gap-5 justify-between mb-2">
                          <p className="text-sm font-medium font-poppins text-white">
                            User ID
                          </p>
                          <p className="text-sm font-medium font-poppins text-white">
                            45jk201fg
                          </p>
                        </li>
                        <li className="w-full flex items-center gap-5 justify-between mb-2">
                          <p className="text-sm font-medium font-poppins text-white">
                            Wallet address :
                          </p>
                          <p className="text-sm font-medium font-poppins text-white">
                            45jk201fg
                          </p>
                        </li>
                        <li className="w-full flex items-center gap-5 justify-between mb-2">
                          <p className="text-sm font-medium font-poppins text-white">
                            Initial Stage :
                          </p>
                          <p className="text-xs font-medium font-poppins text-white bg-green1 p-1 rounded">
                            STAGE A
                          </p>
                        </li>
                        <li className="w-full flex items-center gap-5 justify-between mb-2">
                          <p className="text-sm font-medium font-poppins text-white">
                            Current Stage :
                          </p>
                          <p className="text-xs font-medium font-poppins text-white bg-pink1 p-1 rounded">
                            STAGE C
                          </p>
                        </li>
                        <li className="w-full flex items-center gap-5 justify-between">
                          <p className="text-sm font-medium font-poppins text-white">
                            Referral Reward :
                          </p>
                          <p className="text-sm font-medium font-poppins text-white">
                            10 MEA
                          </p>
                        </li>
                      </ul>

                      <img
                        src="tree-line-right.png"
                        className="absolute -bottom-11 ml-10 left-1/2 -translate-x-1/2 min-w-[100px] h-[45px]"
                        alt=""
                      />
                    </div>

                    <div className="flex items-center justify-between gap-10 -mt-1">
                      <div></div>
                      <div className="w-full max-w-[234px] bg-[url(tree-chart-bg.png)] bg-no-repeat bg-full bg-center p-3 relative mb-12">
                        <ul>
                          <li className="w-full flex items-center gap-5 justify-between mb-2">
                            <p className="text-sm font-medium font-poppins text-white">
                              User ID
                            </p>
                            <p className="text-sm font-medium font-poppins text-white">
                              45jk201fg
                            </p>
                          </li>
                          <li className="w-full flex items-center gap-5 justify-between mb-2">
                            <p className="text-sm font-medium font-poppins text-white">
                              Wallet address :
                            </p>
                            <p className="text-sm font-medium font-poppins text-white">
                              45jk201fg
                            </p>
                          </li>
                          <li className="w-full flex items-center gap-5 justify-between mb-2">
                            <p className="text-sm font-medium font-poppins text-white">
                              Initial Stage :
                            </p>
                            <p className="text-xs font-medium font-poppins text-white bg-green1 p-1 rounded">
                              STAGE A
                            </p>
                          </li>
                          <li className="w-full flex items-center gap-5 justify-between mb-2">
                            <p className="text-sm font-medium font-poppins text-white">
                              Current Stage :
                            </p>
                            <p className="text-xs font-medium font-poppins text-white bg-pink1 p-1 rounded">
                              STAGE C
                            </p>
                          </li>
                          <li className="w-full flex items-center gap-5 justify-between">
                            <p className="text-sm font-medium font-poppins text-white">
                              Referral Reward :
                            </p>
                            <p className="text-sm font-medium font-poppins text-white">
                              10 MEA
                            </p>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </section>
      </div>
      <iframe
        src={`./chart.html?address=${publicKey?.toString()}`}
        width={"100%"}
        height={"700px"}
      ></iframe>
    </>
  );
};

export default OrganizationChart;
