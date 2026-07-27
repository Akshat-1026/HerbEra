const CURRENCIES = {
  INR: { code: "INR", symbol: "₹", locale: "en-IN", rate: 1 },
  USD: { code: "USD", symbol: "$", locale: "en-US", rate: 0.012 },
  EUR: { code: "EUR", symbol: "€", locale: "de-DE", rate: 0.011 },
  GBP: { code: "GBP", symbol: "£", locale: "en-GB", rate: 0.0095 },
  JPY: { code: "JPY", symbol: "¥", locale: "ja-JP", rate: 1.8 },
  CNY: { code: "CNY", symbol: "¥", locale: "zh-CN", rate: 0.087 },
  SAR: { code: "SAR", symbol: "﷼", locale: "ar-SA", rate: 0.045 },
  AED: { code: "AED", symbol: "د.إ", locale: "ar-AE", rate: 0.044 },
};

const LANG_CURRENCY = {
  en: "INR",
  hi: "INR",
  de: "EUR",
  ja: "JPY",
  fr: "EUR",
  es: "EUR",
  zh: "CNY",
  ar: "SAR",
};

export const getCurrencyForLang = (langCode) => {
  const code = LANG_CURRENCY[langCode] || "INR";
  return CURRENCIES[code];
};

export const getCurrency = (code) => {
  return CURRENCIES[code] || CURRENCIES.INR;
};

export const getAllCurrencies = () => {
  return Object.values(CURRENCIES);
};

export const convertPrice = (priceInINR, currencyCode) => {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.INR;
  return Math.round(priceInINR * currency.rate);
};

export const formatPrice = (price, currencyCode = "INR") => {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.INR;
  const converted = Math.round(price * currency.rate);

  if (currency.code === "JPY" || currency.code === "CNY") {
    return `${currency.symbol}${converted.toLocaleString(currency.locale)}`;
  }

  return `${currency.symbol}${converted.toLocaleString(currency.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};
