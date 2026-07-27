import { useState } from "react";
import { Shield, ChevronDown, ChevronUp } from "lucide-react";
import { getCookieConsent, saveCookieConsent } from "../utils/cookieConsent";

const defaultConsent = {
  essential: true,
  analytics: false,
  marketing: false,
};

const CookieConsent = () => {
  const [visible, setVisible] = useState(() => !getCookieConsent());
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState(defaultConsent);

  const handleAcceptAll = () => {
    saveCookieConsent({ essential: true, analytics: true, marketing: true });
    setVisible(false);
  };

  const handleRejectAll = () => {
    saveCookieConsent({ essential: true, analytics: false, marketing: false });
    setVisible(false);
  };

  const handleSavePreferences = () => {
    saveCookieConsent(preferences);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 sm:p-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
            <Shield size={20} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-white">
              We Value Your Privacy
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Herb-Era uses cookies to enhance your experience
            </p>
          </div>
        </div>

        <p className="mb-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          We use cookies to keep our site running smoothly, understand how you use our store,
          and improve your shopping experience. You choose what you&apos;re comfortable with.
        </p>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mb-4 flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400"
        >
          {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {showDetails ? "Hide details" : "Customize my preferences"}
        </button>

        {showDetails && (
          <div className="mb-5 space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-800 dark:text-white">Essential</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Required for login, cart, and checkout. Cannot be turned off.
                </p>
              </div>
              <div className="ml-4 h-5 w-9 cursor-not-allowed rounded-full bg-green-500 px-0.5 py-0.5">
                <div className="h-4 w-4 translate-x-4 rounded-full bg-white" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-800 dark:text-white">Analytics</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Helps us understand which pages you visit and how you browse.
                </p>
              </div>
              <button
                onClick={() => setPreferences((p) => ({ ...p, analytics: !p.analytics }))}
                className={`ml-4 h-6 w-11 rounded-full px-0.5 py-0.5 transition-colors ${
                  preferences.analytics ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-600"
                }`}
              >
                <div className={`h-5 w-5 rounded-full bg-white transition-transform ${preferences.analytics ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-800 dark:text-white">Marketing</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Used to show you relevant product recommendations and offers.
                </p>
              </div>
              <button
                onClick={() => setPreferences((p) => ({ ...p, marketing: !p.marketing }))}
                className={`ml-4 h-6 w-11 rounded-full px-0.5 py-0.5 transition-colors ${
                  preferences.marketing ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-600"
                }`}
              >
                <div className={`h-5 w-5 rounded-full bg-white transition-transform ${preferences.marketing ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={handleRejectAll}
            className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Essential Only
          </button>
          {showDetails && (
            <button
              onClick={handleSavePreferences}
              className="rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 transition hover:bg-green-100 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
            >
              Save Preferences
            </button>
          )}
          <button
            onClick={handleAcceptAll}
            className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
