import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function JournalCard({ article }) {
  const { t } = useTranslation();
  return (
    <Link to={`/blog/${article.slug}`} className="block bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300">
      
      <img
        src={article.image}
        alt={article.title}
        loading="lazy"
        decoding="async"
        className="h-56 w-full object-cover"
      />

      <div className="p-5">
        <span className="text-green-600 text-sm font-semibold">
          {article.category}
        </span>

        <h2 className="text-xl font-bold mt-2 text-zinc-800 dark:text-white">
          {article.title}
        </h2>

        <p className="text-zinc-600 dark:text-zinc-300 mt-3 text-sm leading-relaxed">
          {article.excerpt}
        </p>

        <div className="flex items-center justify-between mt-5 text-sm text-zinc-500">
          <span>{article.author}</span>
          <span>{article.readTime ? `${article.readTime} min read` : article.createdAt ? new Date(article.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : ""}</span>
        </div>

        <span className="mt-5 inline-block bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition">
          {t("journalCard.readMore")}
        </span>
      </div>
    </Link>
  );
}

export default JournalCard;