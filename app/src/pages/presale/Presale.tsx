import React from "react";
import "./style.css";
import { Helmet } from "react-helmet-async";
import PresaleBox from "../../components/presalebox/PresaleBox";

const Presale: React.FC = () => {
  return (
    <main
      className="wrapper community-page"
      style={{
        width: "100%",
      }}
    >
      <Helmet>
        <title>Presale Page</title>
        <meta
          name="description"
          content="Welcome to the Presale page of my application."
        />
      </Helmet>
      <section className="public-sail-sec">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <PresaleBox />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Presale;
