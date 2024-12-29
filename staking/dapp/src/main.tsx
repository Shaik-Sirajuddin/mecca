import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.css";
import "./global.css";
import App from "./App.tsx";
import { WalletWrapper } from "./wallet_wrapper.tsx";
import "./i18n.ts";
import { Provider } from "react-redux";
import store from "./app/store.ts";
import { ToastContainer } from "react-toastify";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ToastContainer autoClose={2500} />
      <WalletWrapper child={<App />} />
    </Provider>
  </StrictMode>
);
