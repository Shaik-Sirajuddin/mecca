import IcoPanel from "./pages/IcoPanel";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Route, Routes } from "react-router";
import AirdropAdmin from "./pages/Airdrop/Airdrop";
import Header from "./components/Header/Header";
import Sidebar from "./components/SideBar/SideBar";
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
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
