import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/unbounded/latin-400.css";
import "@fontsource/unbounded/latin-900.css";
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/latin-700.css";
import "@fontsource/press-start-2p/latin-400.css";
import "./styles.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
