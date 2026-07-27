import { createContext, useContext, useState, useCallback } from "react";
import { formatPrice as baseFormatPrice, getCurrency, getCurrencyForLang, getAllCurrencies } from "../utils/currency";

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currencyCode, setCurrencyCode] = useState(() => {
    return localStorage.getItem("currency") || "INR";
  });

  const setCurrency = useCallback((code) => {
    setCurrencyCode(code);
    localStorage.setItem("currency", code);
  }, []);

  const syncWithLanguage = useCallback((langCode) => {
    const currency = getCurrencyForLang(langCode);
    setCurrency(currency.code);
  }, [setCurrency]);

  const formatPrice = useCallback(
    (price) => baseFormatPrice(price, currencyCode),
    [currencyCode]
  );

  const currency = getCurrency(currencyCode);
  const allCurrencies = getAllCurrencies();

  return (
    <CurrencyContext.Provider value={{ currencyCode, currency, setCurrency, syncWithLanguage, formatPrice, allCurrencies }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
};
