import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Staking from "./pages/staking_pages/staking/Staking";
import Withdrawal from "./pages/staking_pages/withdrawal/Withdrawal";
import './App.css'
const App: React.FC = () => {
  return (
    <>
      <Router>
        <HelmetProvider>
          <Routes>
            {/* Airdrop Pages */}
            <Route path="/" element={<Staking />} />
            {/* Staking Pages */}
            <Route path="/staking" element={<Staking />} />
            <Route path="/withdrawal" element={<Withdrawal />} />
          </Routes>
        </HelmetProvider>
      </Router>
    </>
  );
};

export default App;
