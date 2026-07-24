import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import SEO from "../components/SEO";

function NotFound() {
  const { t } = useTranslation();
  return (
    <>
      <SEO title={t("notFound.pageTitle")} />
      <div className="min-h-screen bg-[#F8F4EF] dark:bg-zinc-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/40 rounded-3xl mb-6"
          >
            <Leaf size={40} className="text-green-600 dark:text-green-400" />
          </motion.div>
          <h1 className="text-7xl font-bold text-green-700 dark:text-green-400 mb-2">{t("notFound.code")}</h1>
          <p className="text-xl font-semibold text-zinc-800 dark:text-zinc-100 mb-2">{t("notFound.message")}</p>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8">
            {t("notFound.description")}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            <Home size={18} />
            {t("notFound.backHome")}
          </Link>
        </motion.div>
      </div>
    </>
  );
}

export default NotFound;
