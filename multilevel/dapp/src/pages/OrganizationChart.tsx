import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";

const OrganizationChart = () => {
  const { publicKey } = useWallet();

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const adjustHeight = () => {
    setTimeout(() => {
      if (iframeRef.current) {
        const iframe = iframeRef.current;
        if (iframe.contentWindow?.document.body) {
          iframe.style.height =
            iframe.contentWindow.document.body.scrollHeight + "px";
        }
        console.log("this data", iframe.contentWindow?.document.body);
      }
    }, 1000);
  };

  useEffect(() => {
    window.addEventListener("resize", adjustHeight);
    adjustHeight();
    setTimeout(() => {
      adjustHeight();
    }, 1000);
    setTimeout(() => {
      adjustHeight();
    }, 2000);
    return () => window.removeEventListener("resize", adjustHeight);
  }, []);

  useEffect(() => {
    //@ts-expect-error this
    window.showToastNotFound = () => {
      toast.error("User not found ");
    };
  }, []);
  return (
    <>
      <Helmet>
        <title>Mecca || Organization Chart</title>
        <meta property="og:title" content="A very important title" />
      </Helmet>

      <div className="w-full bg-black5 relative">
        <div className="w-full max-w-[1162px] mx-auto absolute h-[623px] rounded-full blur-[200px] -top-[400px] left-1/2 -translate-x-1/2 bg-[#6E3359]"></div>
        <section className="w-full relative md:min-h-[600px] bg-black5/50  lg:min-h-[753px]  pb-28 pt-32 lg:pt-[120px]">
          <div className="w-full h-screen absolute top-0 left-0 bg-black z-10"></div>
          <div className="w-ful top-[80vh absolute h-[185px] z-10 -bottom-1"></div>{" "}
          <div className="w-full mx-auto px-5 relative z-20">
            <iframe
              ref={iframeRef}
              src={`./chart.html?address=${publicKey?.toString()}`}
              // src={`./chart.html?address=${"4oAPmx3Sz3pAZSegFbQY1Hk5MqhW2LcxrnQQWWENzjgN"}`}
              width={"100%"}
              // height={"1000px"}
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
