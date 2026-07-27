import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";
import "./i18n/i18n";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./hook/CartHook";
import { WishlistProvider } from "./context/WishlistContext";
import { CouponProvider } from "./context/CouponContext";
import { OrderProvider } from "./hook/Orderhook";
import { AdminProvider } from "./context/AdminContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CompareProvider } from "./context/CompareContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import ErrorBoundary from "./components/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <CouponProvider>
                <OrderProvider>
                  <AdminProvider>
                    <ThemeProvider>
                      <CompareProvider>
                        <CurrencyProvider>
                          <App />
                        </CurrencyProvider>
                      </CompareProvider>
                    </ThemeProvider>
                  </AdminProvider>
                </OrderProvider>
              </CouponProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
