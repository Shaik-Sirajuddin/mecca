import {
  Routes,
  Route,
  useLocation,
  matchPath,
  useNavigate,
} from "react-router-dom";
import Home from "./pages/Home";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import How from "./pages/How";
import Crew from "./pages/Crew";
import OrganizationChart from "./pages/OrganizationChart";
import Dashboard from "./pages/Dashboard";
import NotFoundPage from "./pages/404";
import { useCallback, useEffect } from "react";
import {
  fetchAppState,
  fetchAppStore,
  fetchUserData,
  fetchUserStore,
  getATA,
  getTokenBalance,
  getUserDataAcc,
  getUserStoreAcc,
} from "./utils/web3";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useDispatch, useSelector } from "react-redux";
import {
  setDataSynced,
  setTokenBalance,
  setUserAtaExists,
  setUserData,
  setUserDataAccountId,
  setUserPdaExists,
  setUserStore,
} from "./features/user/userSlice";
import { setAppState, setAppStore } from "./features/global/globalSlice";
import "./App.css";
import toast, { Toaster } from "react-hot-toast";
import { userJoined } from "./network/api";
import { IRootState } from "./app/store";

const useMultiplePathsMatch = (paths: string[]) => {
  const location = useLocation();
  return paths.some((path) => matchPath({ path }, location.pathname));
};

const App = () => {
  const { connection } = useConnection();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { publicKey, connecting } = useWallet();
  const requiresEnrollment = useMultiplePathsMatch([
    "/crew",
    "/organization-chart",
    "/dashboard",
  ]);

  const userEnrolled = useSelector(
    (state: IRootState) => state.user.dataAccExists
  );
  const dataSynced = useSelector((state: IRootState) => state.user.dataSynced);
  const syncAppState = async () => {
    const appState = await fetchAppState(connection);
    dispatch(setAppState(appState.toJSON()));

    const appStore = await fetchAppStore(connection);
    dispatch(setAppStore(appStore.toJSON()));
  };
  const syncUserData = async () => {
    if (!publicKey) return;
    const userDataAcc = getUserDataAcc(publicKey);
    const userData = await fetchUserData(userDataAcc, connection);
    dispatch(setUserDataAccountId(userDataAcc.toString()));
    dispatch(setUserPdaExists(userData != null));
    if (userData) {
      dispatch(setUserData(userData.toJSON()));
      // if user referral staus isn't completed hit endpoint for sync
      console.log(userData.referral_distribution);
      if (!userData.referral_distribution.completed) {
        userJoined(publicKey);
      }
    }
    const userStoreAcc = getUserStoreAcc(publicKey);
    const userStore = await fetchUserStore(userStoreAcc, connection);
    if (userStore) {
      dispatch(setUserStore(userStore.toJSON()));
    }
    const userAta = getATA(publicKey);
    const userBalance = await getTokenBalance(connection, userAta);
    dispatch(setUserAtaExists(userBalance != null));
    dispatch(setTokenBalance(userBalance ? userBalance.toString() : "0"));
    dispatch(setDataSynced(true));
  };

  useEffect(() => {
    syncAppState();
  }, []);

  useEffect(() => {
    syncUserData();
  }, [publicKey]);

  const performCheck = useCallback(() => {
    if ((dataSynced && !userEnrolled) || (!connecting && !publicKey)) {
      navigate("/");
      toast.error("Enrollment required to access the page");
    }
  }, [dataSynced, userEnrolled, connecting, publicKey, navigate]);

  useEffect(() => {
    if (!requiresEnrollment) return;
    const timeoutId = setTimeout(() => {
      performCheck();
    }, 100);

    return () => clearTimeout(timeoutId); // Cleanup timeout on unmount
  }, [performCheck, requiresEnrollment]);

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
      <Toaster position="top-right" />
      <Footer />
    </main>
  );
};

export default App;
