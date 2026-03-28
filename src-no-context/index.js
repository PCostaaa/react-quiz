import React from "react";
import REACTDOM from "react-dom/client";
import "./index.css";
import App from "./components/App";

const root = REACTDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
