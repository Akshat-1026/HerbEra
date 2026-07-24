import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import SEO from "../components/SEO";

function ReturnPolicy() {
  const { t } = useTranslation();

  const sections = [
    { key: "eligibility", title: t("returns.eligibilityTitle") },
    { key: "window", title: t("returns.windowTitle") },
    { key: "process", title: t("returns.processTitle") },
    { key: "refunds", title: t("returns.refundsTitle") },
    { key: "exchanges", title: t("returns.exchangesTitle") },
    { key: "nonReturnable", title: t("returns.nonReturnableTitle") },
    { key: "contact", title: t("returns.contactTitle") },
  ];

  return (
    <>
      <SEO title={t("returns.pageTitle")} description={t("returns.pageDescription")} />
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-xs uppercase tracking-[4px] text-emerald-600 dark:text-emerald-400 mb-4">{t("returns.sectionLabel")}</p>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">{t("returns.heading")}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">{t("returns.lastUpdated")}</p>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 mb-10">{t("returns.intro")}</p>
          </motion.div>

          <div className="space-y-10">
            {sections.map((section, idx) => (
              <motion.div
                key={section.key}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-3">{section.title}</h2>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 whitespace-pre-line">
                  {t(`returns.${section.key}Content`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default ReturnPolicy;
