import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Airdrop from "./pages/airdrop/Airdrop";
import Presale from "./pages/presale/Presale";
import "./App.css";
import { Toaster } from "react-hot-toast";
const App: React.FC = () => {
  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        containerStyle={{
          zIndex: "10000",
          top: "110px",
        }}
      />
      <Router>
        <HelmetProvider>
          <Routes>
            <Route path="/" element={<Presale />} />
            <Route path="/airdrop" element={<Airdrop />} />
            <Route path="/presale" element={<Presale />} />
          </Routes>
        </HelmetProvider>
      </Router>
    </>
  );
};

export default App;
