import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

function DarkModeToggle() {
  const { darkMode, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <button
      onClick={toggleTheme}
      aria-label={t("common.darkMode")}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 transition hover:scale-105"
    >
      {darkMode ? (
        <Sun className="h-5 w-5 text-yellow-400" />
      ) : (
        <Moon className="h-5 w-5 text-gray-800" />
      )}
    </button>
  );
}

export default DarkModeToggle;
