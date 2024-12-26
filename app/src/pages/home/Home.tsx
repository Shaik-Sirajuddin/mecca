import React from "react";
import "./style.css";
import { Helmet } from "react-helmet-async";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Presale from "../presale/Presale";

const Home: React.FC = () => {
  return <Presale />;
};

export default Home;
