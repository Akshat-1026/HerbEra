import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ChevronDown, HelpCircle, Search } from "lucide-react";
import SEO from "../components/SEO";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

function FAQ() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState({});

  const sections = [
    { key: "orders", title: t("faqPage.ordersTitle"), icon: "📦" },
    { key: "shipping", title: t("faqPage.shippingTitle"), icon: "🚚" },
    { key: "returns", title: t("faqPage.returnsTitle"), icon: "↩️" },
    { key: "payment", title: t("faqPage.paymentTitle"), icon: "💳" },
    { key: "products", title: t("faqPage.productsTitle"), icon: "🌿" },
    { key: "account", title: t("faqPage.accountTitle"), icon: "👤" },
    { key: "general", title: t("faqPage.generalTitle"), icon: "❓" },
  ];

  const toggleItem = (sectionKey, idx) => {
    const id = `${sectionKey}-${idx}`;
    setOpenItems((prev) => ({ ...prev, [id]: prev[id] ? null : idx }));
  };

  const getQa = (sectionKey) => {
    const qa = [];
    for (let i = 1; i <= 4; i++) {
      const q = t(`faqPage.${sectionKey}Q${i}`, "");
      const a = t(`faqPage.${sectionKey}A${i}`, "");
      if (q && a) qa.push({ q, a });
    }
    return qa;
  };

  const filteredSections = sections
    .map((sec) => ({
      ...sec,
      items: getQa(sec.key).filter(
        (item) =>
          !searchQuery ||
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.a.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((sec) => sec.items.length > 0);

  return (
    <>
      <SEO title={t("faqPage.pageTitle")} description={t("faqPage.pageDescription")} />
      <div className="min-h-screen bg-[#f8f5ef] dark:bg-zinc-950">
        <div className="mx-auto max-w-3xl px-6 py-12 md:py-20">
          <motion.div {...fadeUp(0)} className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 mb-6">
              <HelpCircle size={32} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-xs uppercase tracking-[4px] text-emerald-600 dark:text-emerald-400 mb-3">
              {t("faqPage.sectionLabel")}
            </p>
            <h1 className="font-serif text-4xl md:text-5xl text-zinc-900 dark:text-white mb-4">
              {t("faqPage.heading")}
            </h1>
            <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
              {t("faqPage.intro")}
            </p>
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="relative mb-10">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("faqPage.searchPlaceholder") || "Search FAQs..."}
              className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-11 pr-5 py-4 text-sm text-zinc-800 dark:text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:border-emerald-500 dark:focus:ring-emerald-900"
            />
          </motion.div>

          {filteredSections.length === 0 ? (
            <motion.p {...fadeUp(0.2)} className="text-center text-zinc-400 py-12">
              {t("faqPage.noResults") || "No FAQs found for your search."}
            </motion.p>
          ) : (
            <div className="space-y-6">
              {filteredSections.map((section, idx) => (
                <motion.div
                  key={section.key}
                  {...fadeUp(0.1 + idx * 0.05)}
                  className="rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden"
                >
                  <div className="flex items-center gap-3 px-6 pt-5 pb-3">
                    <span className="text-lg">{section.icon}</span>
                    <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                      {section.title}
                    </h2>
                  </div>
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {section.items.map((item, i) => {
                      const id = `${section.key}-${i}`;
                      const isOpen = openItems[id] !== undefined ? openItems[id] === i : false;

                      return (
                        <div key={i}>
                          <button
                            onClick={() => toggleItem(section.key, i)}
                            className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                          >
                            <span className={`text-sm font-medium leading-relaxed transition-colors ${
                              isOpen
                                ? "text-emerald-700 dark:text-emerald-400"
                                : "text-zinc-700 dark:text-zinc-300"
                            }`}>
                              {item.q}
                            </span>
                            <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                              isOpen
                                ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                            }`}>
                              <ChevronDown
                                size={15}
                                className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                              />
                            </div>
                          </button>
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="overflow-hidden"
                              >
                                <p className="px-6 pb-5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                  {item.a}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default FAQ;
