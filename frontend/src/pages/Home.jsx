import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useCurrency } from "../context/CurrencyContext";
import Picture from "../components/Picture";
import {
  ArrowRight,
  Hourglass,
  Handshake,
  Gem,
  Star,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import RecentlyViewed from "../components/RecentlyViewed";
import BlobBackground from "../components/BubbleBackground";
import SaleBanner from "../components/SaleBanner";


import { toast } from "react-toastify";
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

export default function Home() {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const heroRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  const [testimonialsData, setTestimonialsData] = useState([]);
  const [faqData, setFaqData] = useState([]);
  const [goals, setGoals] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -50]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/products`);
        setProducts(data);
      } catch {
        toast.error(t("home.errorLoadProducts"));
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();

    axios.get(`${API_URL}/goals/active`).then(({ data }) => {
      setGoals(Array.isArray(data) ? data : []);
    }).catch(() => {});

    axios.get(`${API_URL}/testimonials`).then(({ data }) => {
      setTestimonialsData(Array.isArray(data) ? data : []);
    }).catch(() => {});

    axios.get(`${API_URL}/faqs`).then(({ data }) => {
      setFaqData(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const philosophy = [
    {
      title: t("home.philosophyCard1Title"),
      desc: t("home.philosophyCard1Desc"),
      icon: Hourglass,
    },
    {
      title: t("home.philosophyCard2Title"),
      desc: t("home.philosophyCard2Desc"),
      icon: Handshake,
    },
    {
      title: t("home.philosophyCard3Title"),
      desc: t("home.philosophyCard3Desc"),
      icon: Gem,
    },
  ];

  const [journals, setJournals] = useState([]);
  const [combos, setCombos] = useState([]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/blogs`).then(({ data }) => {
      const list = Array.isArray(data) ? data : data.blogs || [];
      setJournals(list.slice(0, 3));
    }).catch(() => {});
    axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/combos`).then(({ data }) => {
      setCombos(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  return (
    <>
    <SEO title={t("home.pageTitle")} description={t("home.pageDescription")} />
    <div className="relative overflow-hidden bg-[#f8f5ef] text-[#1f3a2f] dark:bg-[#0d0d0d] dark:text-white">
      <BlobBackground />
      <SaleBanner />
      {/* HERO */}
      <section ref={heroRef} className="relative flex min-h-screen flex-col-reverse items-center justify-between gap-8 px-6 py-12 md:px-14 lg:flex-row lg:px-24 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-[#2d5c49]/5 via-transparent to-transparent pointer-events-none" />
        <motion.div style={{ y: textY }} className="max-w-2xl will-change-transform">
          <motion.p
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="mb-4 text-sm uppercase tracking-[5px] text-[#557c6c]"
          >
            {t("home.heroLabel")}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, type: "spring", stiffness: 100 }}
            className="mb-4 font-serif text-4xl leading-tight md:text-7xl"
          >
            {t("home.heroTitle")}
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="h-1 w-24 bg-[#2d5c49] rounded-full mb-8 origin-left"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="mb-10 max-w-xl text-lg leading-relaxed text-gray-600 dark:text-gray-300"
          >
            {t("home.heroDesc")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            className="flex flex-wrap gap-5"
          >
            <Link to="/products">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 rounded-2xl bg-[#1b3b2f] px-8 py-4 text-white shadow-lg transition hover:bg-[#264d3d]"
              >
                {t("home.shopCollection")}
                <ArrowRight size={18} />
              </motion.button>
            </Link>
            <Link to="/about">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-2xl border border-[#1b3b2f] px-8 py-4 transition hover:bg-[#1b3b2f]/10 dark:border-white"
              >
                {t("home.ourStory")}
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div style={{ y: imageY }} className="relative will-change-transform">
          <motion.div
            animate={{ y: [0, -12, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 scale-110 rounded-full bg-[#2d5c49]/20 blur-3xl"
          />
          <Picture
            src="/images/hero.jpg"
            alt={t("home.heroAlt")}
            className="relative z-10 w-full max-w-[600px] rounded-[40px] object-cover shadow-2xl md:w-[800px] md:max-w-[800px]"
          />
        </motion.div>
      </section>

      {/* SHOP BY GOAL */}
      {goals.length > 0 && (
        <section className="px-6 py-14 md:px-14 lg:px-24">
          <div className="mb-8 text-center">
            <motion.p {...fadeUp(0)} className="mb-3 text-sm uppercase tracking-[4px] text-[#557c6c]">
              {t("home.shopByGoalLabel")}
            </motion.p>
            <motion.h2 {...fadeUp(0.1)} className="font-serif text-4xl md:text-5xl">
              {t("home.shopByGoalTitle")}
            </motion.h2>
            <motion.p {...fadeUp(0.2)} className="mt-5 max-w-2xl mx-auto text-gray-600 dark:text-gray-300 leading-relaxed">
              {t("home.shopByGoalDesc")}
            </motion.p>
          </div>
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {goals.map((goal, i) => (
              <motion.div
                key={goal._id}
                {...stagger(i, 0.08)}
              >
                <Link
                  to={`/products?goal=${goal.slug}`}
                  className="group relative block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-500 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {goal.image ? (
                    <div className="relative aspect-[5/7] overflow-hidden">
                      <img
                        src={goal.image}
                        alt={goal.name}
                        loading="lazy"
                        className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="font-serif text-xl text-white mb-1.5">{goal.name}</h3>
                        {goal.description && (
                          <p className="text-xs text-white/70 line-clamp-3 leading-relaxed">{goal.description}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="relative flex aspect-[5/7] items-center justify-center bg-gradient-to-br from-[#2d5c49]/10 to-[#2d5c49]/5 dark:from-[#2d5c49]/20 dark:to-[#2d5c49]/10">
                      <div className="text-center px-6 py-10">
                        <h3 className="font-serif text-xl mb-2">{goal.name}</h3>
                        {goal.description && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto line-clamp-3 leading-relaxed">{goal.description}</p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between px-6 py-4">
                    <span className="text-xs font-semibold text-[#1b3b2f] dark:text-white">
                      {t("home.shopByGoalExplore")}
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2d5c49]/10 text-[#2d5c49] transition-all duration-300 group-hover:bg-[#2d5c49] group-hover:text-white dark:bg-[#2d5c49]/20 dark:text-emerald-400">
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* PHILOSOPHY */}
      <section className="relative px-6 py-14 md:px-14 lg:px-24">
        <div className="mb-10">
          <motion.p {...fadeUp(0)} className="mb-3 text-sm uppercase tracking-[4px] text-[#557c6c]">
            {t("home.philosophyLabel")}
          </motion.p>
          <motion.h2 {...fadeUp(0.1)} className="mb-6 font-serif text-4xl md:text-5xl">
            {t("home.philosophyTitle")}
          </motion.h2>
          <motion.p {...fadeUp(0.2)} className="max-w-3xl leading-relaxed text-gray-600 dark:text-gray-300">
            {t("home.philosophyDesc")}
          </motion.p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {philosophy.map((item, index) => (
            <motion.div
              key={index}
              {...stagger(index)}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="group relative rounded-3xl bg-white px-6 py-5 shadow-md transition-shadow hover:shadow-2xl dark:bg-[#161616]"
            >
              <div className="mb-2.5 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2d5c49]/10 text-[#2d5c49] transition-colors group-hover:bg-[#2d5c49] group-hover:text-white dark:bg-[#2d5c49]/20">
                  <item.icon size={18} />
                </div>
                <h3 className="font-serif text-xl">{item.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="px-6 py-14 md:px-14 lg:px-24">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <motion.p {...fadeUp(0)} className="mb-2 text-sm uppercase tracking-[4px] text-[#557c6c]">
              {t("home.bestSellers")}
            </motion.p>
            <motion.h2 {...fadeUp(0.1)} className="font-serif text-3xl md:text-4xl">
              {t("home.bestSellersTitle")}
            </motion.h2>
          </div>
          <motion.div {...fadeUp(0.2)}>
            <Link
              to="/products"
              className="group flex items-center gap-2 text-[#1b3b2f] transition-all hover:gap-4 dark:text-white"
            >
              {t("home.viewAll")}
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="animate-pulse rounded-[30px] bg-white dark:bg-[#161616] overflow-hidden">
                <div className="h-72 bg-zinc-200 dark:bg-zinc-800" />
                <div className="p-6 space-y-3">
                  <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="h-5 w-40 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard
                key={product._id}
                product={product}
                index={index}
                showPrice={false}
              />
            ))}
          </div>
        )}
      </section>

      {/* COMBOS */}
      {combos.length > 0 && (
        <section className="px-6 py-14 md:px-14 lg:px-24 bg-[#2d5c49]/5 dark:bg-[#2d5c49]/10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <motion.p {...fadeUp(0)} className="mb-2 text-sm uppercase tracking-[4px] text-[#557c6c]">
                {t("home.bestSellers")}
              </motion.p>
              <motion.h2 {...fadeUp(0.1)} className="font-serif text-3xl md:text-4xl">
                Value Combos
              </motion.h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {combos.map((combo, idx) => (
              <motion.div
                key={combo._id}
                {...stagger(idx, 0.12)}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group rounded-2xl bg-white dark:bg-[#161616] shadow-md overflow-hidden"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={combo.image}
                    alt={combo.name}
                    loading="lazy"
                    className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-2">{combo.name}</h3>
                  {combo.description && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3">{combo.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {combo.products?.slice(0, 4).map((p) => (
                      <span key={p._id} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                        {p.name}
                      </span>
                    ))}
                    {combo.products?.length > 4 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                        +{combo.products.length - 4} more
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{formatPrice(combo.comboPrice)}</span>
                    {combo.originalPrice > 0 && (
                      <>
                        <span className="text-sm text-zinc-400 line-through">{formatPrice(combo.originalPrice)}</span>
                        <span className="ml-auto text-xs font-medium text-red-500">
                          {Math.round((1 - combo.comboPrice / combo.originalPrice) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* JOURNAL */}
      <section className="px-6 py-14 md:px-14 lg:px-24">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <motion.p {...fadeUp(0)} className="mb-2 text-sm uppercase tracking-[4px] text-[#557c6c]">
              {t("home.journalLabel")}
            </motion.p>
            <motion.h2 {...fadeUp(0.1)} className="font-serif text-3xl md:text-4xl">
              {t("home.journalTitle")}
            </motion.h2>
          </div>
          <motion.div {...fadeUp(0.2)}>
            <Link
              to="/journal"
              className="group flex items-center gap-2 transition-all hover:gap-4"
            >
              {t("home.readMore")}
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {journals.map((article, index) => (
            <motion.div
              key={article._id}
              {...stagger(index, 0.15)}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="group overflow-hidden rounded-[30px] bg-white shadow-md transition-shadow hover:shadow-2xl dark:bg-[#161616]"
            >
              <div className="relative overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  loading="lazy"
                  decoding="async"
                  className="h-64 w-full object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
              <div className="p-6">
                <p className="mb-3 text-sm text-[#557c6c]">{t("home.journalCategory")}</p>
                <h3 className="mb-5 font-serif text-2xl leading-snug">
                  {article.title}
                </h3>
                <Link
                  to={`/blog/${article.slug}`}
                  className="flex items-center gap-2 text-[#1b3b2f] transition-all hover:gap-4 dark:text-white"
                >
                  {t("home.readArticle")}
                  <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-6 py-14 md:px-14 lg:px-24 bg-[#2d5c49]/5 dark:bg-[#2d5c49]/10">
        <div className="text-center mb-10">
          <motion.p {...fadeUp(0)} className="mb-2 text-sm uppercase tracking-[4px] text-[#557c6c]">
            {t("home.testimonialsLabel")}
          </motion.p>
          <motion.h2 {...fadeUp(0.1)} className="font-serif text-3xl md:text-4xl">
            {t("home.testimonialsTitle")}
          </motion.h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3 max-w-6xl mx-auto">
          {testimonialsData.length > 0 ? testimonialsData.map((item, i) => (
            <motion.div
              key={item._id || i}
              {...stagger(i, 0.12)}
              className="rounded-[30px] bg-white dark:bg-[#161616] shadow-md overflow-hidden"
            >
              {item.video ? (
                <div className="aspect-video w-full bg-black">
                  {item.video.includes("youtube.com") || item.video.includes("youtu.be") ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${item.video.includes("youtu.be") ? item.video.split("/").pop().split("?")[0] : new URL(item.video).searchParams.get("v") || item.video.split("/").pop().split("?")[0]}`}
                      className="h-full w-full"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      title={`${item.name} video testimonial`}
                    />
                  ) : item.video.includes("vimeo.com") ? (
                    <iframe
                      src={`https://player.vimeo.com/video/${item.video.split("/").pop().split("?")[0]}`}
                      className="h-full w-full"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      title={`${item.name} video testimonial`}
                    />
                  ) : (
                    <video src={item.video} controls className="h-full w-full object-cover" />
                  )}
                </div>
              ) : null}
              <div className="p-8">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: item.rating || 5 }).map((_, s) => (
                    <Star key={s} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 italic">
                  "{item.text}"
                </p>
                <div className="flex items-center gap-3">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#2d5c49]/20 flex items-center justify-center text-[#2d5c49] font-bold">
                      {item.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.location}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-3 text-center text-zinc-400 py-8">{t("home.noTestimonials")}</div>
          )}
        </div>
      </section>

      {/* Recently Viewed */}
      <RecentlyViewed />

      {/* FAQ */}
      <section className="relative px-6 py-20 md:px-14 lg:px-24 bg-[#1B263B]/5 dark:bg-[#1B263B]/10">
        <div className="mx-auto max-w-6xl flex flex-col lg:flex-row gap-12 lg:gap-20">
          <div className="lg:w-1/3 lg:sticky lg:top-28 lg:self-start">
            <motion.div {...fadeUp(0)}>
              <p className="text-sm uppercase tracking-[4px] text-[#64748B] mb-4">
                {t("home.faqLabel")}
              </p>
              <h2 className="font-serif text-4xl md:text-5xl text-zinc-900 dark:text-white mb-4">
                {t("home.faqTitle")}
              </h2>
              <p className="text-gray-500 leading-relaxed">
                Everything you need to know about our products and services.
              </p>
            </motion.div>
          </div>
          <div className="lg:w-2/3 space-y-3">
            {faqData.length > 0 ? faqData.slice(0, 5).map((item, i) => (
              <motion.div
                key={item._id || i}
                {...stagger(i, 0.06)}
                className={`rounded-2xl border transition-all duration-300 ${
                  openFaq === i
                    ? "border-[#0D1B2A]/20 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900"
                    : "border-gray-200 bg-white/60 dark:border-zinc-700 dark:bg-zinc-900/60 hover:bg-white hover:shadow-md dark:hover:bg-zinc-900"
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 leading-snug">
                    {item.question}
                  </span>
                  <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    openFaq === i
                      ? "bg-[#0D1B2A] text-white dark:bg-white dark:text-[#0D1B2A]"
                      : "bg-[#0D1B2A]/10 text-[#0D1B2A] dark:bg-zinc-700 dark:text-zinc-300"
                  }`}>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-100 dark:border-zinc-700 mx-6" />
                      <p className="px-6 pb-6 pt-4 text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )) : (
              <div className="text-center text-zinc-400 py-16">{t("home.noFAQs")}</div>
            )}
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
