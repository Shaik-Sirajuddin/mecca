import React from "react";
import "./style.css";
import { Helmet } from "react-helmet-async";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import PresaleBox from "../../components/presalebox/PresaleBox";

const Presale: React.FC = () => {
  return (
    <main className="wrapper community-page">
      <Helmet>
        <title>Presale Page</title>
        <meta
          name="description"
          content="Welcome to the Presale page of my application."
        />
      </Helmet>
      <Header />
      <section className="public-sail-sec">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="text-box bototm-space">
                <h1>
                  <span>MECCA </span>
                  PUBLIC SAIL
                </h1>
              </div>
              <PresaleBox />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default Presale;
