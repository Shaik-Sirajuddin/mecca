import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import { HelmetProvider } from "react-helmet-async";
import Airdrop from "./pages/airdrop/Airdrop";
import Community from "./pages/community/Community";
import Presale from "./pages/presale/Presale";
import "./App.css";
const App: React.FC = () => {
  return (
    <>
      <Router>
        <HelmetProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/airdrop" element={<Airdrop />} />
            <Route path="/community" element={<Community />} />
            <Route path="/presale" element={<Presale />} />
          </Routes>
        </HelmetProvider>
      </Router>
    </>
  );
};

export default App;
