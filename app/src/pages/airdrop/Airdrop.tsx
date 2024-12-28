import React from "react";
import "./style.css";
import { Helmet } from "react-helmet-async";
import AirdropPeriod from "../../components/airdrop-period/AirdropPeriod";

const Airdrop: React.FC = () => {
  return (
    <main
      className="wrapper community-page"
      style={{
        width: "100%",
      }}
    >
      <Helmet>
        <title>Airdrop Page</title>
        <meta
          name="description"
          content="Welcome to the home page of my application."
        />
      </Helmet>
      <div className="airdrop-period-box">
        <AirdropPeriod />
      </div>
    </main>
  );
};

export default Airdrop;
