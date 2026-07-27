import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useCurrency } from "../context/CurrencyContext";

// UK Flag SVG component for English
const UKFlag = () => (
  <svg
    className="w-4.5 h-3 rounded-sm object-cover shadow-sm border border-gray-200/50 dark:border-gray-700/50 flex-shrink-0"
    viewBox="0 0 60 30"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect width="60" height="30" fill="#012169" />
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" />
    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
  </svg>
);

// India Flag SVG component for Hindi
const IndiaFlag = () => (
  <svg
    className="w-4.5 h-3 rounded-sm object-cover shadow-sm border border-gray-200/50 dark:border-gray-700/50 flex-shrink-0"
    viewBox="0 0 900 600"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect width="900" height="200" fill="#FF9933" />
    <rect y="200" width="900" height="200" fill="#FFFFFF" />
    <rect y="400" width="900" height="200" fill="#128807" />
    <circle cx="450" cy="300" r="80" fill="none" stroke="#000080" strokeWidth="10" />
    <circle cx="450" cy="300" r="15" fill="#000080" />
    <path d="M 450,220 L 450,380 M 370,300 L 530,300 M 393.5,243.5 L 506.5,356.5 M 393.5,356.5 L 506.5,243.5" stroke="#000080" strokeWidth="6" />
    <path d="M 450,300 L 420,226 M 450,300 L 480,226 M 450,300 L 420,374 M 450,300 L 480,374 M 450,300 L 376,270 M 450,300 L 376,330 M 450,300 L 524,270 M 450,300 L 524,330" stroke="#000080" strokeWidth="6" />
  </svg>
);

const GermanyFlag = () => (
  <svg className="w-4.5 h-3 rounded-sm object-cover shadow-sm border border-gray-200/50 dark:border-gray-700/50 flex-shrink-0" viewBox="0 0 5 3" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="5" height="1" fill="#000" />
    <rect y="1" width="5" height="1" fill="#D00" />
    <rect y="2" width="5" height="1" fill="#FFCE00" />
  </svg>
);

const JapanFlag = () => (
  <svg className="w-4.5 h-3 rounded-sm object-cover shadow-sm border border-gray-200/50 dark:border-gray-700/50 flex-shrink-0" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="900" height="600" fill="#fff" />
    <circle cx="450" cy="300" r="180" fill="#BC002D" />
  </svg>
);

const FranceFlag = () => (
  <svg className="w-4.5 h-3 rounded-sm object-cover shadow-sm border border-gray-200/50 dark:border-gray-700/50 flex-shrink-0" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="300" height="600" fill="#0055A4" />
    <rect x="300" width="300" height="600" fill="#fff" />
    <rect x="600" width="300" height="600" fill="#EF4135" />
  </svg>
);

const SpainFlag = () => (
  <svg className="w-4.5 h-3 rounded-sm object-cover shadow-sm border border-gray-200/50 dark:border-gray-700/50 flex-shrink-0" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="900" height="200" fill="#C60B1E" />
    <rect y="200" width="900" height="200" fill="#FFC400" />
    <rect y="400" width="900" height="200" fill="#C60B1E" />
  </svg>
);

const ChinaFlag = () => (
  <svg className="w-4.5 h-3 rounded-sm object-cover shadow-sm border border-gray-200/50 dark:border-gray-700/50 flex-shrink-0" viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="30" height="20" fill="#DE2910" />
    <polygon points="4,2.5 4.7,4.3 6.5,4.3 5,5.3 5.5,7 4,6 2.5,7 3,5.3 1.5,4.3 3.3,4.3" fill="#FFDE00" />
    <polygon points="9,1.5 9.2,2.1 9.8,2.1 9.3,2.5 9.5,3 9,2.7 8.5,3 8.7,2.5 8.2,2.1 8.8,2.1" fill="#FFDE00" />
    <polygon points="10.5,3.5 10.7,4.1 11.3,4.1 10.8,4.5 11,5 10.5,4.7 10,5 10.2,4.5 9.7,4.1 10.3,4.1" fill="#FFDE00" />
    <polygon points="10,5.5 10.2,6.1 10.8,6.1 10.3,6.5 10.5,7 10,6.7 9.5,7 9.7,6.5 9.2,6.1 9.8,6.1" fill="#FFDE00" />
    <polygon points="8.8,5 9,5.4 9.5,5.4 9.1,5.7 9.3,6.2 8.8,5.9 8.3,6.2 8.5,5.7 8.1,5.4 8.6,5.4" fill="#FFDE00" />
  </svg>
);

const UAEiranFlag = () => (
  <svg className="w-4.5 h-3 rounded-sm object-cover shadow-sm border border-gray-200/50 dark:border-gray-700/50 flex-shrink-0" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="900" height="200" fill="#009E00" />
    <rect y="200" width="900" height="200" fill="#fff" />
    <rect y="400" width="900" height="200" fill="#000" />
    <rect width="200" height="600" fill="#CE1126" />
  </svg>
);

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { syncWithLanguage } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const languages = [
    { code: "en", label: "EN", name: "English", flagIcon: <UKFlag /> },
    { code: "hi", label: "हि", name: "हिन्दी", flagIcon: <IndiaFlag /> },
    { code: "de", label: "DE", name: "Deutsch", flagIcon: <GermanyFlag /> },
    { code: "ja", label: "JA", name: "日本語", flagIcon: <JapanFlag /> },
    { code: "fr", label: "FR", name: "Français", flagIcon: <FranceFlag /> },
    { code: "es", label: "ES", name: "Español", flagIcon: <SpainFlag /> },
    { code: "zh", label: "ZH", name: "中文", flagIcon: <ChinaFlag /> },
    { code: "ar", label: "AR", name: "العربية", flagIcon: <UAEiranFlag /> },
  ];

  const current = languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-white transition-colors text-xs uppercase tracking-widest font-semibold"
        aria-label="Switch language"
      >
        {current.flagIcon}
        <span>{current.label}</span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                syncWithLanguage(lang.code);
                setOpen(false);
              }}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                i18n.language === lang.code
                  ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              {lang.flagIcon}
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
