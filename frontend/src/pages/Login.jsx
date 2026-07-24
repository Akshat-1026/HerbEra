import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import  useAuth  from "../hook/AuthContextHook";
import { useNavigate, Link } from "react-router-dom";
import { Leaf } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import SEO from "../components/SEO";

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login, userInfo } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo) {
      navigate("/", { replace: true });
    }
  }, [userInfo, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError(t("login.fillFields"));
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      navigate("/", { replace: true });
    } else {
      setError(result.message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Google login failed");
    }
  };

  return (

    <>
    <SEO title={t("login.pageTitle")} />
    <div className="flex min-h-screen items-center justify-center bg-[#f8f5ef] px-6 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-md dark:bg-zinc-900">
        <div className="mb-8 text-center">
          <Leaf className="mx-auto text-green-600" size={40} />

          <h2 className="mt-4 text-3xl font-bold text-zinc-800 dark:text-white">
            {t("login.heading")}
          </h2>

          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            {t("login.description")}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-100 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t("login.emailLabel")}
            </label>

            <input
              type="email"
              placeholder={t("login.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-zinc-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-green-500 dark:focus:ring-green-800"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t("login.passwordLabel")}
            </label>

            <input
              type="password"
              placeholder={t("login.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-zinc-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-green-500 dark:focus:ring-green-800"
            />
            <Link
              to="/forgot-password"
              className="mt-2 inline-block text-xs font-medium text-green-600 hover:text-green-700 dark:text-green-400"
            >
              {t("login.forgotPassword")}
            </Link>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-green-600 p-3 text-lg font-semibold text-white transition hover:bg-green-700"
          >
            {t("login.signIn")}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-zinc-400 dark:bg-zinc-900">{t("login.or") || "or"}</span>
            </div>
          </div>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google login failed")}
              text="continue_with"
              shape="rectangular"
              width="100%"
            />
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {t("login.newHere")}{" "}
          <Link
            to="/register"
            className="font-medium text-green-600 hover:text-green-700"
          >
            {t("login.createAccount")}
          </Link>
        </p>
      </div>
    </div>
    </>
  );
};

export default Login;