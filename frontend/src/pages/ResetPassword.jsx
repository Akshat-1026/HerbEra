import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react";
import api from "../services/api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import SEO from "../components/SEO";

const ResetPassword = () => {
  const { t } = useTranslation();
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error(t("resetPassword.fillFields"));
      return;
    }

    if (password.length < 6) {
      toast.error(t("resetPassword.minLength"));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t("resetPassword.passwordsDontMatch"));
      return;
    }

    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
      toast.success(t("resetPassword.successToast"));
    } catch (err) {
      toast.error(err.response?.data?.message || t("resetPassword.errorGeneral"));
    } finally {
      setLoading(false);
    }
  };

  return (

    <>
    <SEO title={t("resetPassword.pageTitle")} />
    <div className="flex min-h-screen items-center justify-center bg-[#f8f5ef] px-6 dark:bg-zinc-950">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-md dark:bg-zinc-900"
      >
        {!success ? (
          <>
            <div className="mb-8 text-center">
              <Lock className="mx-auto text-green-600" size={40} />
              <h2 className="mt-4 text-3xl font-bold text-zinc-800 dark:text-white">
                {t("resetPassword.heading")}
              </h2>
              <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                {t("resetPassword.description")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {t("resetPassword.newPasswordLabel")}
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder={t("resetPassword.newPasswordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white p-3 pr-10 text-zinc-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-green-500 dark:focus:ring-green-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {t("resetPassword.confirmLabel")}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    placeholder={t("resetPassword.confirmPlaceholder")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white p-3 pr-10 text-zinc-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-green-500 dark:focus:ring-green-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                  >
                    {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-green-600 p-3 text-lg font-semibold text-white transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t("resetPassword.resetting") : t("resetPassword.resetBtn")}
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
              {t("resetPassword.successHeading")}
            </h2>
            <p className="mt-3 text-zinc-500 dark:text-zinc-400">
              {t("resetPassword.successMessage")}
            </p>
          </motion.div>
        )}

        {success && (
          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400"
            >
              <ArrowLeft size={16} />
              {t("resetPassword.backToLogin")}
            </Link>
          </div>
        )}
      </motion.div>
    </div>
    </>
  );
};

export default ResetPassword;
