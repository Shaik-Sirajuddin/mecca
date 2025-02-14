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
import Users from "./pages/Game/Users";
import UsersPage from "./pages/Multilevel/Users";
import ProtectedPage from "./pages/ProtectedPage";
import ResetPassword from "./pages/ResetPassword";
import ConfirmResetPassword from "./pages/ConfirmReset";
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
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/confirm-reset" element={<ConfirmResetPassword />} />

            <Route
              path="/*"
              element={
                <ProtectedPage>
                  <Routes>
                    <Route path="/" element={<IcoPanel />} />
                    <Route path="/airdrop" element={<AirdropAdmin />} />
                    <Route path="/staking" element={<Staking />} />
                    <Route path="/mecca" element={<MultiLevel />} />
                    <Route path="/mecca/users" element={<UsersPage />} />
                    <Route path="/game" element={<Game />} />
                    <Route path="/game/users" element={<Users />} />
                  </Routes>
                </ProtectedPage>
              }
            />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
