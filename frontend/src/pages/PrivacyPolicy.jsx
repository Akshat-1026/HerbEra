import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import SEO from "../components/SEO";

function PrivacyPolicy() {
  const { t } = useTranslation();

  const sections = [
    { key: "infoCollect", title: t("privacy.infoCollectTitle") },
    { key: "infoUse", title: t("privacy.infoUseTitle") },
    { key: "infoShare", title: t("privacy.infoShareTitle") },
    { key: "cookies", title: t("privacy.cookiesTitle") },
    { key: "dataSecurity", title: t("privacy.dataSecurityTitle") },
    { key: "thirdParty", title: t("privacy.thirdPartyTitle") },
    { key: "yourRights", title: t("privacy.yourRightsTitle") },
    { key: "policyUpdates", title: t("privacy.policyUpdatesTitle") },
    { key: "contact", title: t("privacy.contactTitle") },
  ];

  return (
    <>
      <SEO title={t("privacy.pageTitle")} description={t("privacy.pageDescription")} />
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-xs uppercase tracking-[4px] text-emerald-600 dark:text-emerald-400 mb-4">{t("privacy.sectionLabel")}</p>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">{t("privacy.heading")}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">{t("privacy.lastUpdated")}</p>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 mb-10">{t("privacy.intro")}</p>
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
                  {t(`privacy.${section.key}Content`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default PrivacyPolicy;
