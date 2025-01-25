import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import How from "./pages/How";
import Crew from "./pages/Crew";
import OrganizationChart from "./pages/OrganizationChart";
import Dashboard from "./pages/Dashboard";
import NotFoundPage from "./pages/404";
import { useEffect } from "react";
import {
  fetchAppState,
  fetchUserData,
  getATA,
  getTokenBalance,
  getUserDataAcc,
} from "./utils/web3";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useDispatch } from "react-redux";
import {
  setTokenBalance,
  setUserAtaExists,
  setUserData,
  setUserDataAccountId,
  setUserPdaExists,
} from "./features/user/userSlice";
import { setAppState } from "./features/global/globalSlice";

const App = () => {
  const { connection } = useConnection();
  const dispatch = useDispatch();
  const { publicKey } = useWallet();

  const syncAppState = async () => {
    const appState = await fetchAppState(connection);
    dispatch(setAppState(appState.toJSON()));
  };
  const syncUserData = async () => {
    if (!publicKey) return;
    const userDataAcc = getUserDataAcc(publicKey);
    const userData = await fetchUserData(userDataAcc, connection);
    dispatch(setUserDataAccountId(userDataAcc.toString()));
    dispatch(setUserPdaExists(userData != null));
    if (userData) {
      dispatch(setUserData(userData.toJSON()));
    }
    const userAta = getATA(publicKey);
    const userBalance = await getTokenBalance(connection, userAta);
    dispatch(setUserAtaExists(userBalance != null));
    dispatch(setTokenBalance(userBalance ? userBalance.toString() : "0"));
  };

  useEffect(() => {
    syncAppState();
  }, []);

  useEffect(() => {
    syncUserData();
  }, [publicKey]);

  return (
    <main className="font-poppins">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/how" element={<How />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/crew" element={<Crew />} />
        <Route path="/organization-chart" element={<OrganizationChart />} />
        <Route path="/*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </main>
  );
};

export default App;
