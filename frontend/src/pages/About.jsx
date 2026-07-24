import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { useTranslation } from "react-i18next";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function About() {
  const { t } = useTranslation();
  const [content, setContent] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/site-content/about`).then(({ data }) => {
      if (data) setContent(data);
    }).catch(() => {});
  }, []);

  const sectionLabel = content?.sectionLabel || t("about.sectionLabel");
  const heading = content?.heading || t("about.heading");
  const description = content?.description || t("about.description");
  const description2 = content?.description2 || t("about.description2");
  const ctaText = content?.ctaText || t("about.cta");
  const ctaLink = content?.ctaLink || "/products";
  const image = content?.image || "/images/ashwagandha.jpg";
  const imageAlt = content?.imageAlt || t("about.founderAlt");
  const philosophy = content?.philosophy?.length > 0 ? content.philosophy : [
    { title: t("about.philosophy1Title"), desc: t("about.philosophy1Desc") },
    { title: t("about.philosophy2Title"), desc: t("about.philosophy2Desc") },
    { title: t("about.philosophy3Title"), desc: t("about.philosophy3Desc") },
  ];

  return (
    <>
      <SEO title={t("about.pageTitle")} />
      <div className="min-h-screen bg-[#fdfaf6] text-[#1b3b2f] dark:bg-[#0d0d0d] dark:text-white font-inter transition-colors duration-500">
        {/* Main Story Section */}
        <section className="flex flex-col md:flex-row items-center justify-between px-10 py-20 gap-10">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="max-w-xl"
          >
            <p className="uppercase text-xs tracking-widest text-[#1b3b2f]/70 dark:text-gray-400 mb-2">
              {sectionLabel}
            </p>
            <h1 className="text-4xl font-serif mb-6 leading-snug dark:text-white">
              {heading}
            </h1>
            {description && (
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {description}
              </p>
            )}
            {description2 && (
              <p className="text-gray-700 dark:text-gray-300 mb-8">
                {description2}
              </p>
            )}
            <Link
              to={ctaLink}
              className="inline-block bg-[#1b3b2f] text-[#fdfaf6] dark:bg-green-600 dark:text-white px-6 py-3 rounded-full shadow-md hover:scale-105 transition-transform duration-300"
            >
              {ctaText}
            </Link>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="shrink-0"
          >
            <img
              src={image}
              alt={imageAlt}
              loading="lazy"
              decoding="async"
              className="w-[400px] h-[480px] object-cover rounded-2xl shadow-lg dark:shadow-green-900/40 transition-shadow duration-500"
            />
          </motion.div>
        </section>

        {/* Divider */}
        <div className="border-t border-[#e5e2da] dark:border-gray-700 mx-10 mb-10 transition-colors duration-500"></div>

        {/* Philosophy Highlights */}
        <section className="px-10 pb-20 grid md:grid-cols-3 gap-8 text-center">
          {philosophy.map((item, i) => (
            <div key={i} className="bg-white dark:bg-[#161616] rounded-2xl p-6 shadow-md dark:shadow-lg transition-all duration-500">
              <h3 className="font-serif text-lg mb-2 dark:text-green-400">{item.title}</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {item.desc}
              </p>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
