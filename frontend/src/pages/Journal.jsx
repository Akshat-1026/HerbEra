import { useEffect, useState } from "react";
import axios from "axios";
import JournalCard from "../components/JournalCard";
import FeaturedArticle from "../components/FeaturedArticle";
import SEO from "../components/SEO";
import { useTranslation } from "react-i18next";

function Journal() {
  const { t } = useTranslation();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/blogs`).then(({ data }) => {
      setArticles(Array.isArray(data) ? data : data.blogs || []);
    }).catch(() => {});
  }, []);
  return (

    <>
    <SEO title={t("journal.pageTitle")} />
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-0">
        <img src="/images/productbackground.webp" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-white/20 dark:bg-black/20" />
      </div>

      <div className="relative z-10 px-6 md:px-14 py-10">

        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-zinc-800 dark:text-white">
            {t("journal.heading")}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-300 mt-4 max-w-2xl mx-auto">
            {t("journal.description")}
          </p>
        </div>

        {/* FEATURED */}
        <FeaturedArticle />

        {/* ARTICLES */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <JournalCard key={article._id} article={article} />
          ))}
        </div>
      </div>
    </div>
    </>
  );
}

export default Journal;
