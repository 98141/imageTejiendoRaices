import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

import { CartProvider } from "./cart/cartContext";
import HealthGate from "./system/HealthGate.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <HealthGate>
          <App />
        </HealthGate>
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
);
