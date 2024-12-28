import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Airdrop from "./pages/airdrop/Airdrop";
import Presale from "./pages/presale/Presale";
import "./App.css";
const App: React.FC = () => {
  return (
    <>
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
