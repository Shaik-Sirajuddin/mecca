import React from "react";
import "./style.css";
import { Helmet } from "react-helmet-async";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import AirdropPeriod from "../../components/airdrop-period/AirdropPeriod";
import Faqs from "../../components/faqs/faqs";

const Airdrop: React.FC = () => {
  return (
    <main className="wrapper community-page">
      <Helmet>
        <title>Airdrop Page</title>
        <meta
          name="description"
          content="Welcome to the home page of my application."
        />
      </Helmet>
      <Header />
      <section className="airdrop-sec">
        <div className="container">
          <div className="row airdrop-wrap">
            <div className="col-md-12">
              <div className="text-box bototm-space">
                <h1>
                  <span>MECCA </span>
                  AIRDROP
                </h1>
              </div>
              <AirdropPeriod />
            </div>
          </div>
        </div>
      </section>
      <section className="mecca-staking-sec">
        <div className="container">
          <div className="mecca-staking-wrap">
            <div className="row mecca-staking-wrap">
              <div className="col-md-12">
                <div className="text-box">
                  <h2>
                    <span>MECCA </span>
                    STAKING
                  </h2>
                </div>
                <div className="mecca-staking--box">
                  <div className="mecca-staking-allow">
                    <h3>
                      <span>MECCA</span> staking allows you to join the
                      ecosystem and increase your assets.
                    </h3>
                    <div className="d-flex">
                      <button className="start-staking-btn">
                        START STAKING
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="coming-sec">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="coming-wrap">
                <div className="coming-heading">
                  <h2>MECCA Coming soon</h2>
                </div>
                <ul className="coming-grid">
                  <li className="coming-col">
                    <img src="/images/payment-logo.png" alt="" />
                    <p>Payment</p>
                  </li>
                  <li className="coming-col">
                    <img src="/images/network-logo.png" alt="" />
                    <p>Network marketing</p>
                  </li>
                  <li className="coming-col">
                    <img src="/images/game-logo.png" alt="" />
                    <p>Game</p>
                  </li>
                  <li className="coming-col">
                    <img src="/images/shopping-logo.png" alt="" />
                    <p>Shopping</p>
                  </li>
                  <li className="coming-col">
                    <img src="/images/nft-webtoon-logo.png" alt="" />
                    <p>NFT Webtoon Market</p>
                  </li>
                  <li className="coming-col">
                    <p className="more-text">More</p>
                  </li>
                </ul>
                <div className="strengthens-text">
                  <h4>
                    MECCA strengthens the ecosystem with various services.
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="faqs-sec">
        <div className="container">
          <div className="faqs-wrap">
            <div className="row">
              <div className="col-md-12">
                <div className="faqs-heading">
                  <h2>Frequently Asked Questions</h2>
                </div>

                <div className="faqs-row">
                  <Faqs />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default Airdrop;
