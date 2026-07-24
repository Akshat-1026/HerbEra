import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function FeaturedArticle() {
  const { t } = useTranslation();
  return (
    <div className="relative rounded-3xl overflow-hidden mb-14">
      
      <img
        src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80"
        alt={t("featuredArticle.alt")}
        loading="lazy"
        decoding="async"
        className="w-full h-[400px] object-cover"
      />

      <div className="absolute inset-0 bg-black/50 flex flex-col justify-center p-10">
        
        <span className="text-green-400 font-semibold mb-3">
          {t("featuredArticle.badge")}
        </span>

        <h1 className="text-4xl md:text-5xl font-bold text-white max-w-2xl">
          {t("featuredArticle.heading")}
        </h1>

        <p className="text-zinc-200 mt-5 max-w-xl">
          {t("featuredArticle.description")}
        </p>

        <Link to="/blog" className="mt-6 w-fit bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition inline-block">
          {t("featuredArticle.cta")}
        </Link>
      </div>
    </div>
  );
}

export default FeaturedArticle;