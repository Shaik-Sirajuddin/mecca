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
          <div className="w-full bg-xl-gradient top-[80vh] absolute h-[185px] z-10 -bottom-1"></div>{" "}
          <div className="w-full max-w-[1280px] mx-auto px-5 relative z-20">
            <iframe
              src={`./chart.html?address=${publicKey?.toString()}`}
              // src={`./chart.html?address=${"HUnqK3yo6xmbhf4L7WJwhEEJcFS4gmuUMzvmPTkaJqRA"}`}
              width={"100%"}
              height={"800px"}
              scrolling="no"
            ></iframe>
            <div className="w-full text-center"></div>
          </div>
        </section>
      </div>
    </>
  );
};

export default OrganizationChart;
