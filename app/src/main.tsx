import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.css";
import "./global.css";
import App from "./App.tsx";
import { WalletWrapper } from "./pages/wallet_wrapper.tsx";
import { Toaster } from "react-hot-toast";
createRoot(document.getElementById("ico-root")!).render(
  <StrictMode>
    <Toaster
      position="top-right"
      reverseOrder={false}
      containerStyle={{
        zIndex: "10000",
      }}
    />
    <WalletWrapper child={<App />} />
  </StrictMode>
);
