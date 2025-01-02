import React from "react";
import Header from "../../../components/header/Header";
import "./global.css";
import { Tooltip as ReactToolTip } from "react-tooltip";

interface NodeProps {
  children: React.ReactNode;
}

const RootLayout: React.FC<NodeProps> = ({ children }) => {
  return (
    <main className="wrapper page-bg">
      <Header />
      {children}
      <ReactToolTip place="top" id="my-tooltip" />
    </main>
  );
};

export default RootLayout;
