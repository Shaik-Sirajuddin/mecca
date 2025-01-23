import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import "./App.css";
import { useWallet } from "@solana/wallet-adapter-react";

function App() {
  const { publicKey } = useWallet();
  const enroll = () => {
   
  };
  return (
    <>
      <button onClick={enroll}>Enroll Plan A</button>
    </>
  );
}

export default App;
