const CONSENT_KEY = "herbEra_cookie_consent";

export const getCookieConsent = () => {
  try {
    const saved = localStorage.getItem(CONSENT_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const saveCookieConsent = (consent) => {
  const data = { ...consent, timestamp: Date.now() };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
};
