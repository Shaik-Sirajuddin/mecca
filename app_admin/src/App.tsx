import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Route, Routes } from "react-router-dom";
import AirdropAdmin from "./pages/Airdrop/Airdrop";
import Header from "./components/Header/Header";
import Sidebar from "./components/SideBar/SideBar";
import Login from "./pages/Login/Login";
import IcoPanel from "./pages/Ico/IcoPanel";
import Staking from "./pages/staking/Staking";
import MultiLevel from "./pages/Multilevel/Multilevel";
import Game from "./pages/Game/Game";
function App() {
  return (
    <>
      <div style={{ display: "flex" }} className="app-wrapper">
        <Sidebar />
        <Header />
        <div
          style={{ marginLeft: "250px", padding: "20px", width: "100%" }}
          className="routes-wrapper"
        >
          <Routes>
            <Route path="/" element={<IcoPanel />} />
            <Route path="/airdrop" element={<AirdropAdmin />} />
            <Route path="/plogin" element={<Login />} />
            <Route path="/staking" element={<Staking />} />
            <Route path="/multilevel" element={<MultiLevel />} />
            <Route path="/game" element={<Game />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
