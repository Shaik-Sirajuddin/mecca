import React from "react";
import Header from "../../../components/header/Header";
import "./global.css";
import Footer from "../../../components/footer/Footer";

interface NodeProps {
  children: React.ReactNode;
}

const RootLayout: React.FC<NodeProps> = ({ children }) => {
  return (
    <main className="wrapper page-bg">
      <Header />
      {children}
      <Footer />
    </main>
  );
};

export default RootLayout;
