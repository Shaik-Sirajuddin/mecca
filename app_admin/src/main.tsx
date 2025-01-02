import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";
import { WalletWrapper } from "./wallet_wrapper.tsx";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div>
      <BrowserRouter>
        <Toaster />
        <WalletWrapper child={<App />} />
      </BrowserRouter>
    </div>
  </StrictMode>
);
