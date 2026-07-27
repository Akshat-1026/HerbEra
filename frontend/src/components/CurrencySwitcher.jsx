import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useCurrency } from "../context/CurrencyContext";

const FLAG_MAP = {
  INR: "🇮🇳",
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  JPY: "🇯🇵",
  CNY: "🇨🇳",
  SAR: "🇸🇦",
  AED: "🇦🇪",
};

function CurrencySwitcher() {
  const { currencyCode, setCurrency, allCurrencies } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-white transition-colors text-xs uppercase tracking-widest font-semibold"
        aria-label="Switch currency"
      >
        <span>{FLAG_MAP[currencyCode] || "🇮🇳"}</span>
        <span>{currencyCode}</span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
          {allCurrencies.map((c) => (
            <button
              key={c.code}
              onClick={() => {
                setCurrency(c.code);
                setOpen(false);
              }}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                currencyCode === c.code
                  ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              <span>{FLAG_MAP[c.code]}</span>
              <span>{c.code}</span>
              <span className="ml-auto text-xs text-gray-400">{c.symbol}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default CurrencySwitcher;
