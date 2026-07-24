import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, User } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import SEO from "../components/SEO";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

function BlogPost() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({ name: "", email: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/blogs/${slug}`);
        setBlog(data);

        const { data: allData } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/blogs`, {
          params: { category: data.category, limit: 4 },
        });
        setRelated(allData.blogs.filter((b) => b.slug !== slug).slice(0, 3));
      } catch {
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentForm.name || !commentForm.email || !commentForm.comment) {
      toast.error(t("blogPost.allFieldsRequired"));
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/blogs/${slug}/comments`, commentForm);
      setBlog((prev) => ({ ...prev, comments: [...(prev.comments || []), data] }));
      setCommentForm({ name: "", email: "", comment: "" });
      toast.success(t("blogPost.commentAdded"));
    } catch {
      toast.error(t("blogPost.commentFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f7f2] dark:bg-black px-6 md:px-14 py-10">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-[400px] bg-zinc-200 dark:bg-zinc-800 rounded-[30px] mb-8" />
          <div className="space-y-4">
            <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-10 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-[#f8f7f2] dark:bg-black flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="text-3xl font-serif mb-4">{t("blogPost.notFound")}</h2>
          <Link to="/blog" className="text-[#557c6c] dark:text-green-400 underline">{t("blogPost.backToJournal")}</Link>
        </div>
      </div>
    );
  }

  return (
    <>
    <SEO title={blog?.title} description={blog?.excerpt} image={blog?.image} />
    <div className="min-h-screen bg-[#f8f7f2] dark:bg-black">
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img
          src={blog.image}
          alt={blog.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-14 max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm uppercase tracking-[4px] text-green-400 mb-3"
          >
            {blog.category}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif text-white leading-tight mb-4"
          >
            {blog.title}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center gap-4 text-white/80 text-sm"
          >
            <span className="flex items-center gap-1"><User size={14} /> {blog.author}</span>
            <span className="flex items-center gap-1"><Clock size={14} /> {blog.readTime} min read</span>
            <span>{formatDate(blog.createdAt)}</span>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-14 py-12">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-[#557c6c] dark:text-green-400 hover:gap-3 transition-all mb-8"
        >
          <ArrowLeft size={16} /> {t("blogPost.backToJournal")}
        </Link>

        <motion.div {...fadeUp(0)} className="prose prose-lg dark:prose-invert max-w-none">
          {(blog.content || "").split("\n").map((paragraph, i) => (
            paragraph.trim() && (
              <p key={i} className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6 text-lg">
                {paragraph}
              </p>
            )
          ))}
        </motion.div>

        {blog.tags && blog.tags.length > 0 && (
          <motion.div {...fadeUp(0.1)} className="flex flex-wrap gap-3 mt-10">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 rounded-full bg-white dark:bg-[#161616] text-sm text-zinc-600 dark:text-zinc-400 shadow-sm"
              >
                #{tag}
              </span>
            ))}
          </motion.div>
        )}

        <motion.div {...fadeUp(0.2)} className="mt-16 border-t border-zinc-200 dark:border-zinc-800 pt-10">
          <h3 className="text-2xl font-serif mb-8">{t("blogPost.comments")} ({blog.comments.length})</h3>

          {blog.comments.length === 0 ? (
            <p className="text-zinc-500 dark:text-zinc-400 mb-8">{t("blogPost.noComments")}</p>
          ) : (
            <div className="space-y-6 mb-10">
              {blog.comments.map((c, i) => (
                <div key={i} className="bg-white dark:bg-[#161616] rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-zinc-800 dark:text-white">{c.name}</span>
                    <span className="text-xs text-zinc-400">{formatDate(c.createdAt)}</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">{c.comment}</p>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleCommentSubmit} className="bg-white dark:bg-[#161616] rounded-[30px] p-8 shadow-md">
            <h4 className="text-lg font-serif mb-6">{t("blogPost.leaveComment")}</h4>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder={t("blogPost.yourName")}
                value={commentForm.name}
                onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#557c6c] dark:text-white"
              />
              <input
                type="email"
                placeholder={t("blogPost.yourEmail")}
                value={commentForm.email}
                onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#557c6c] dark:text-white"
              />
            </div>
            <textarea
              placeholder={t("blogPost.writeComment")}
              rows={4}
              value={commentForm.comment}
              onChange={(e) => setCommentForm({ ...commentForm, comment: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#557c6c] dark:text-white mb-4"
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-full bg-[#1b3b2f] text-white font-medium hover:bg-[#264d3d] transition disabled:opacity-50"
            >
              {submitting ? t("blogPost.submitting") : t("blogPost.postComment")}
            </button>
          </form>
        </motion.div>

        {related.length > 0 && (
          <motion.div {...fadeUp(0.3)} className="mt-20">
            <h3 className="text-2xl font-serif mb-8">{t("blogPost.relatedArticles")}</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {related.map((r, i) => (
                <motion.div
                  key={r._id}
                  {...fadeUp(i * 0.1)}
                  whileHover={{ y: -10, transition: { duration: 0.3 } }}
                  className="group overflow-hidden rounded-[30px] bg-white dark:bg-[#161616] shadow-md hover:shadow-2xl"
                >
                  <Link to={`/blog/${r.slug}`}>
                    <div className="relative overflow-hidden">
                      <img
                        src={r.image}
                        alt={r.title}
                        loading="lazy"
                        decoding="async"
                        className="h-48 w-full object-cover transition duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-5">
                      <p className="mb-2 text-sm text-[#557c6c] dark:text-green-400">{r.category}</p>
                      <h4 className="font-serif text-lg leading-snug">{r.title}</h4>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
    </>
  );
}

export default BlogPost;
