import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import SEO from "../components/SEO";
import { useTranslation } from "react-i18next";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock3,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function Contact() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/contact`,
        form
      );
      setSuccess(data.message);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError(err.response?.data?.message || t("contact.errorGeneral"));
    } finally {
      setLoading(false);
    }
  };

  const contactMethods = [
    {
      icon: <Mail size={18} />,
      label: t("contact.emailHeading"),
      value: t("contact.email"),
      href: `mailto:${t("contact.email")}`,
    },
    {
      icon: <Phone size={18} />,
      label: t("contact.phoneHeading"),
      value: t("contact.phone"),
      href: `tel:${t("contact.phone").replace(/\s/g, "")}`,
    },
    {
      icon: <MapPin size={18} />,
      label: t("contact.locationHeading"),
      value: t("contact.location"),
      href: null,
    },
  ];

  const hours = [
    { day: t("contact.monFri"), time: t("contact.monFriHours"), closed: false },
    { day: t("contact.saturday"), time: t("contact.saturdayHours"), closed: false },
    { day: t("contact.sunday"), time: t("contact.sundayHours"), closed: true },
  ];

  const features = [
    { icon: <Clock3 size={20} />, title: t("contact.fastSupport"), desc: t("contact.fastSupportDesc") },
    { icon: <CheckCircle size={20} />, title: t("contact.secureExperience"), desc: t("contact.secureExperienceDesc") },
    { icon: <Mail size={20} />, title: t("contact.trustedAyurveda"), desc: t("contact.trustedAyurvedaDesc") },
  ];

  return (
    <>
      <SEO title={t("contact.pageTitle")} />
      <div className="min-h-screen bg-white dark:bg-[#0d0d0d] transition-colors duration-300">

        {/* ===== TOP BAR ===== */}
        <div className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
          <div className="absolute inset-0">
            <img src="/images/productbackground.webp" alt="" className="h-full w-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-[#1b3b2f]/85 dark:bg-black/80" />
          <div className="relative mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:py-14">
            <div>
              <p className="mb-1 text-[11px] font-semibold tracking-[0.2em] text-emerald-300 uppercase dark:text-emerald-400">
                {t("contact.sectionLabel")}
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                {t("contact.heading")}
              </h1>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-emerald-100/70 dark:text-zinc-400">
              {t("contact.description")}
            </p>
          </div>
        </div>

        {/* ===== CONTACT METHOD STRIP ===== */}
        <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#0d0d0d]">
          <div className="mx-auto grid max-w-6xl grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800">
            {contactMethods.map((method, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="flex items-center gap-4 px-6 py-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2d5c49]/8 text-[#2d5c49] dark:bg-emerald-500/10 dark:text-emerald-400">
                  {method.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
                    {method.label}
                  </p>
                  {method.href ? (
                    <a
                      href={method.href}
                      className="text-sm font-medium text-[#1a1a1a] transition hover:text-[#2d5c49] dark:text-white dark:hover:text-emerald-400"
                    >
                      {method.value}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-[#1a1a1a] dark:text-white">{method.value}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-16 lg:grid-cols-12">

            {/* LEFT — Contact Form */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7"
            >
              <h2 className="mb-1 text-xl font-semibold tracking-tight text-[#1a1a1a] dark:text-white">
                {t("contact.sendMessage")}
              </h2>
              <p className="mb-8 text-sm text-zinc-400 dark:text-zinc-500">
                {t("contact.description")}
              </p>

              {success && (
                <div className="mb-6 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                  <CheckCircle size={16} className="shrink-0" />
                  {success}
                </div>
              )}

              {error && (
                <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-300">
                      {t("contact.yourName")}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder={t("contact.yourName")}
                      required
                      className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none transition placeholder:text-zinc-400 focus:border-[#2d5c49] focus:ring-1 focus:ring-[#2d5c49]/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/30"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-300">
                      {t("contact.yourEmail")}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder={t("contact.yourEmail")}
                      required
                      className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none transition placeholder:text-zinc-400 focus:border-[#2d5c49] focus:ring-1 focus:ring-[#2d5c49]/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    {t("contact.subject")}
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder={t("contact.subject")}
                    required
                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none transition placeholder:text-zinc-400 focus:border-[#2d5c49] focus:ring-1 focus:ring-[#2d5c49]/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    {t("contact.messagePlaceholder")}
                  </label>
                  <textarea
                    rows="5"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder={t("contact.messagePlaceholder")}
                    required
                    className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none transition placeholder:text-zinc-400 focus:border-[#2d5c49] focus:ring-1 focus:ring-[#2d5c49]/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1b3b2f] px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#243f36] disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {loading ? t("contact.sending") : t("contact.sendMessageBtn")}
                </button>
              </form>
            </motion.div>

            {/* RIGHT — Sidebar */}
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="space-y-8 lg:col-span-5"
            >
              {/* Business Hours */}
              <div>
                <div className="mb-4 flex items-center gap-2.5">
                  <Clock3 size={16} className="text-[#2d5c49] dark:text-emerald-400" />
                  <h3 className="text-sm font-semibold tracking-tight text-[#1a1a1a] dark:text-white">
                    {t("contact.hoursHeading")}
                  </h3>
                </div>
                <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                  {hours.map((h, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between px-4 py-3 ${
                        i < hours.length - 1 ? "border-b border-zinc-200 dark:border-zinc-800" : ""
                      } ${i % 2 === 0 ? "bg-[#fdfaf6] dark:bg-zinc-900" : "bg-white dark:bg-[#0d0d0d]"}`}
                    >
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">{h.day}</span>
                      <span className={`text-sm font-medium ${h.closed ? "text-red-500" : "text-[#1a1a1a] dark:text-white"}`}>
                        {h.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="mb-3 text-sm font-semibold tracking-tight text-[#1a1a1a] dark:text-white">
                  {t("contact.followUs")}
                </h3>
                <div className="flex gap-2">
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 transition-colors hover:border-[#2d5c49] hover:text-[#2d5c49] dark:border-zinc-700 dark:text-zinc-500 dark:hover:border-emerald-500 dark:hover:text-emerald-400">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 transition-colors hover:border-[#2d5c49] hover:text-[#2d5c49] dark:border-zinc-700 dark:text-zinc-500 dark:hover:border-emerald-500 dark:hover:text-emerald-400">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z"/></svg>
                  </a>
                   <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 transition-colors hover:border-[#2d5c49] hover:text-[#2d5c49] dark:border-zinc-700 dark:text-zinc-500 dark:hover:border-emerald-500 dark:hover:text-emerald-400">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 transition-colors hover:border-[#2d5c49] hover:text-[#2d5c49] dark:border-zinc-700 dark:text-zinc-500 dark:hover:border-emerald-500 dark:hover:text-emerald-400">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
                  </a>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-zinc-200 dark:border-zinc-800" />

              {/* Quick Response Promise */}
              <div className="rounded-lg bg-[#fdfaf6] p-5 dark:bg-zinc-900">
                <p className="mb-1 text-sm font-medium text-[#1a1a1a] dark:text-white">
                  {t("contact.fastSupport")}
                </p>
                <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {t("contact.fastSupportDesc")}
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ===== MAP ===== */}
        <div className="border-t border-zinc-200 bg-[#fdfaf6] dark:border-zinc-800 dark:bg-[#111111]">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="mb-6">
              <h2 className="text-sm font-semibold tracking-tight text-[#1a1a1a] dark:text-white">
                {t("contact.locationHeading")}
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">{t("contact.location")}</p>
            </div>
            <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.546!2d77.5!3d28.4!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjnCsDI0JzAwLjAiTiA3N8KwMzAnMDAuMCJF!5e0!3m2!1sen!2sin!4v1"
                width="100%"
                height="320"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t("contact.mapTitle")}
              />
            </div>
          </div>
        </div>

        {/* ===== FEATURES ===== */}
        <div className="border-t border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y sm:grid-cols-3 sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                {...fadeUp}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className="flex items-start gap-4 px-8 py-10"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2d5c49]/8 text-[#2d5c49] dark:bg-emerald-500/10 dark:text-emerald-400">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-[#1a1a1a] dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
