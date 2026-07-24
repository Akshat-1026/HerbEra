import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Loader } from "lucide-react";

import { useTranslation } from "react-i18next";
import newsletterApi from "../api/newsletterApi";

export default function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMsg] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const data = await newsletterApi.subscribe(email);
      setMsg(data.message);
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setMsg(t("newsletter.error"));
    }
  };

  return (
    <footer className="relative z-10 bg-[#0D1B2A] text-gray-300">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-8 md:px-14 lg:px-24">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* BRAND */}
          <div className="lg:col-span-1">
            <Link to="/" className="mb-4 flex items-center gap-2.5">
              <img src="/images/logo.jpg" alt="Herb-Era" className="h-8 w-auto rounded" />
              <span className="text-xl font-black tracking-wide font-playfair text-white">
                Herb<span className="font-medium italic text-emerald-400">Era</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              {t("footer.tagline")} {t("footer.tagline2")}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gray-400 transition hover:bg-pink-600 hover:text-white hover:scale-110" aria-label={t("footer.instagram")}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gray-400 transition hover:bg-blue-600 hover:text-white hover:scale-110" aria-label={t("footer.facebook")}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gray-400 transition hover:bg-sky-600 hover:text-white hover:scale-110" aria-label={t("footer.twitter")}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gray-400 transition hover:bg-red-600 hover:text-white hover:scale-110" aria-label={t("footer.pinterest")}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M9.04 21.54c.96.3 1.97.46 3.01.46A10 10 0 0 0 12 2a10 10 0 0 0-3.9 19.24c-.04-.67-.07-1.7.02-2.13.1-.48 1.08-4.58 1.08-4.58s-.28-.56-.28-1.38c0-1.3.75-2.26 1.69-2.26.8 0 1.19.6 1.19 1.32 0 .8-.5 2-.77 3.12-.23.93.46 1.68 1.38 1.68 1.65 0 2.92-1.74 2.92-4.25 0-2.22-1.6-3.77-3.88-3.77-2.64 0-4.2 1.99-4.2 4.04 0 .8.31 1.66.7 2.12a.28.28 0 0 1 .07.27c-.08.32-.24.96-.27 1.09-.04.18-.14.22-.32.13-1.19-.56-1.94-2.3-1.94-3.7 0-3 2.2-5.77 6.3-5.77 3.3 0 5.88 2.36 5.88 5.52 0 3.3-2.08 5.95-4.96 5.95-.97 0-1.88-.5-2.19-1.1l-.6 2.28c-.2.8-.75 1.8-1.12 2.4z"/></svg>
              </a>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[3px] text-gray-400">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="text-gray-400 transition hover:text-white">{t("footer.home")}</Link></li>
              <li><Link to="/products" className="text-gray-400 transition hover:text-white">{t("footer.shop")}</Link></li>
              <li><Link to="/about" className="text-gray-400 transition hover:text-white">{t("footer.ourStory")}</Link></li>
              <li><Link to="/faq" className="text-gray-400 transition hover:text-white">{t("footer.faq")}</Link></li>
              <li><Link to="/journal" className="text-gray-400 transition hover:text-white">{t("footer.journal")}</Link></li>
              <li><Link to="/contact" className="text-gray-400 transition hover:text-white">{t("footer.contact")}</Link></li>
            </ul>
          </div>

          {/* POLICIES */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[3px] text-gray-400">
              {t("footer.policies")}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/privacy" className="text-gray-400 transition hover:text-white">{t("footer.privacy")}</Link></li>
              <li><Link to="/terms" className="text-gray-400 transition hover:text-white">{t("footer.terms")}</Link></li>
              <li><Link to="/shipping-policy" className="text-gray-400 transition hover:text-white">{t("footer.shipping")}</Link></li>
              <li><Link to="/returns" className="text-gray-400 transition hover:text-white">{t("footer.returns")}</Link></li>
              <li><Link to="/cancellation" className="text-gray-400 transition hover:text-white">{t("footer.cancellation")}</Link></li>
              <li><Link to="/cookie-policy" className="text-gray-400 transition hover:text-white">{t("footer.cookiePolicy")}</Link></li>
              <li><Link to="/disclaimer" className="text-gray-400 transition hover:text-white">{t("footer.disclaimer")}</Link></li>
            </ul>
          </div>

          {/* NEWSLETTER + CONTACT */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[3px] text-gray-400">
              {t("newsletter.heading")}
            </h3>
            <p className="mb-4 text-sm text-gray-400">
              {t("newsletter.subheading")}
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("newsletter.placeholder")}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-60"
              >
                {status === "loading" ? <Loader size={16} className="animate-spin" /> : t("newsletter.subscribe")}
              </button>
            </form>
            {message && (
              <p className={`mt-2 text-xs ${status === "error" ? "text-red-400" : "text-emerald-400"}`}>
                {message}
              </p>
            )}

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-2.5 text-sm text-gray-400">
                <Mail size={16} className="text-emerald-500" />
                <a href="mailto:info@herb-era.com" className="transition hover:text-white">
                  info@herb-era.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
