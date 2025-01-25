import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import { WalletWrapper } from "./wallet_wrapper.tsx";
import { Provider } from "react-redux";
import store from "./app/store.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Provider store={store}>
          <WalletWrapper>
            <App />
          </WalletWrapper>
        </Provider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
