import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import api from "../services/api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import SEO from "../components/SEO";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error(t("forgotPassword.enterEmail"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t("forgotPassword.validEmail"));
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || t("forgotPassword.errorGeneral"));
    } finally {
      setLoading(false);
    }
  };

  return (

    <>
    <SEO title={t("forgotPassword.pageTitle")} />
    <div className="flex min-h-screen items-center justify-center bg-[#f8f5ef] px-6 dark:bg-zinc-950">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-md dark:bg-zinc-900"
      >
        {!sent ? (
          <>
            <div className="mb-8 text-center">
              <Lock className="mx-auto text-green-600" size={40} />
              <h2 className="mt-4 text-3xl font-bold text-zinc-800 dark:text-white">
                {t("forgotPassword.heading")}
              </h2>
              <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                {t("forgotPassword.description")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {t("forgotPassword.emailLabel")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    type="email"
                    placeholder={t("forgotPassword.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white p-3 pl-10 text-zinc-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-green-500 dark:focus:ring-green-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-green-600 p-3 text-lg font-semibold text-white transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t("forgotPassword.sending") : t("forgotPassword.sendResetLink")}
              </button>
            </form>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle2 className="mx-auto text-green-500" size={64} />
            </motion.div>
            <h2 className="mt-6 text-2xl font-bold text-zinc-800 dark:text-white">
              {t("forgotPassword.successHeading")}
            </h2>
            <p className="mt-3 text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {t("forgotPassword.successMessage")} <strong className="text-zinc-700 dark:text-zinc-300">{email}</strong>
            </p>
            <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
              {t("forgotPassword.followUp")}{" "}
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="font-medium text-green-600 hover:text-green-700 dark:text-green-400"
              >
                {t("forgotPassword.tryAgain")}
              </button>
            </p>
          </motion.div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400"
          >
            <ArrowLeft size={16} />
            {t("forgotPassword.backToLogin")}
          </Link>
        </div>
      </motion.div>
    </div>
    </>
  );
};

export default ForgotPassword;
