import React from "react";
import Header from "../../../components/header/Header";
import "./global.css";

interface NodeProps {
  children: React.ReactNode;
}

const RootLayout: React.FC<NodeProps> = ({ children }) => {
  return (
    <main className="wrapper page-bg">
      <Header />
      {children}
    </main>
  );
};

export default RootLayout;
