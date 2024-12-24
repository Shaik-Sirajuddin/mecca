import { useState } from "react";
import "./App.css";
import ICO from "./pages/ICO";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const App: React.FC = () => {
  return (
    <div>
      <ICO />
      <WalletMultiButton />
    </div>
  );
};
export default App;
