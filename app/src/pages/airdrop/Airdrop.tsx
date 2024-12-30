import React from "react";
import "./style.css";
import { Helmet } from "react-helmet-async";
import AirdropPeriod from "../../components/airdrop-period/AirdropPeriod";

const Airdrop: React.FC = () => {
  return (
    <main
      className="wrapper"
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#202020",
        height: "100%",
        minHeight: "550px",
      }}
    >
      <Helmet>
        <title>Airdrop Page</title>
        <meta
          name="description"
          content="Welcome to the home page of my application."
        />
      </Helmet>
      <div className="">
        <AirdropPeriod />
      </div>
    </main>
  );
};

export default Airdrop;
