import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import SEO from "../components/SEO";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

const stagger = (index, base = 0.1) => ({
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay: index * base, ease: "easeOut" },
});

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

function Blog() {
  const { t } = useTranslation();
  const categories = [t("blog.all"), t("blog.wellness"), t("blog.herbs"), t("blog.lifestyle")];
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [pages, setPages] = useState(1);
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "All");

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 9 };
        if (activeCategory !== "All") params.category = activeCategory;
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/blogs`, { params });
        setBlogs(data.blogs);
        setPages(data.pages);
        setPage(data.page);
      } catch {
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [activeCategory, page]);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setPage(1);
    const params = {};
    if (cat !== "All") params.category = cat;
    setSearchParams(params);
  };

  return (
    <>
    <SEO title={t("blog.pageTitle")} description={t("blog.pageDescription")} />
    <div className="min-h-screen bg-[#f8f7f2] dark:bg-black px-6 md:px-14 py-10">
      <div className="text-center mb-12">
        <motion.p {...fadeUp(0)} className="mb-3 text-sm uppercase tracking-[5px] text-[#557c6c] dark:text-green-400">
          {t("blog.sectionLabel")}
        </motion.p>
        <motion.h1 {...fadeUp(0.1)} className="text-3xl sm:text-5xl font-bold text-zinc-800 dark:text-white font-serif">
          {t("blog.heading")}
        </motion.h1>
        <motion.p {...fadeUp(0.2)} className="text-zinc-600 dark:text-zinc-300 mt-4 max-w-2xl mx-auto">
          {t("blog.description")}
        </motion.p>
      </div>

      <motion.div {...fadeUp(0.3)} className="flex flex-wrap justify-center gap-4 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat
                ? "bg-[#1b3b2f] text-white"
                : "bg-white dark:bg-[#161616] text-zinc-700 dark:text-zinc-300 hover:bg-[#1b3b2f]/10 dark:hover:bg-[#2d5c49]/20"
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="animate-pulse rounded-[30px] bg-white dark:bg-[#161616] overflow-hidden">
              <div className="h-56 bg-zinc-200 dark:bg-zinc-800" />
              <div className="p-6 space-y-3">
                <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-5 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">{t("blog.noArticles")}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog, index) => (
            <motion.div
              key={blog._id}
              {...stagger(index, 0.12)}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="group overflow-hidden rounded-[30px] bg-white shadow-md transition-shadow hover:shadow-2xl dark:bg-[#161616]"
            >
              <Link to={`/blog/${blog.slug}`}>
                <div className="relative overflow-hidden">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    loading="lazy"
                    decoding="async"
                    className="h-56 w-full object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>
                <div className="p-6">
                  <p className="mb-3 text-sm text-[#557c6c] dark:text-green-400">{blog.category}</p>
                  <h3 className="font-serif text-2xl leading-snug mb-3">{blog.title}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-4 line-clamp-2">{blog.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500">
                    <span>{blog.author}</span>
                    <div className="flex items-center gap-3">
                      <span>{blog.readTime} {t("blog.minRead")}</span>
                      <span>{formatDate(blog.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <motion.div {...fadeUp(0.4)} className="flex justify-center items-center gap-4 mt-16">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-6 py-3 rounded-full bg-white dark:bg-[#161616] shadow-md disabled:opacity-40 font-medium transition hover:shadow-xl"
          >
            {t("blog.previous")}
          </button>
          <span className="text-zinc-600 dark:text-zinc-400">
            {t("blog.page")} {page} {t("blog.of")} {pages}
          </span>
          <button
            disabled={page >= pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            className="px-6 py-3 rounded-full bg-white dark:bg-[#161616] shadow-md disabled:opacity-40 font-medium transition hover:shadow-xl"
          >
            {t("blog.next")}
          </button>
        </motion.div>
      )}
    </div>
    </>
  );
}

export default Blog;
