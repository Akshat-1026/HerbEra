import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import ProductCard from "../components/ProductCard";
import SEO from "../components/SEO";

export default function CategoryProducts() {
  const { t } = useTranslation();
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const catName = category?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/products/search?category=${category}`)
      .then(({ data }) => { if (mounted) setProducts(data.products || data || []); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [category]);

  return (
    <>
      <SEO title={catName} description={`Browse our collection of ${catName} products`} />
      <div className="min-h-screen bg-[#f8f5ef] dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link to="/products" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors mb-6">
            <ArrowLeft size={16} />
            {t("products.allProducts")}
          </Link>
          <h1 className="font-serif text-4xl font-bold text-zinc-800 dark:text-white mb-2 capitalize">{catName}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8">
            {loading ? "Loading..." : `${products.length} products`}
          </p>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="animate-pulse rounded-xl bg-white dark:bg-zinc-900 overflow-hidden">
                  <div className="aspect-[4/3] bg-zinc-200 dark:bg-zinc-800" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-zinc-400">{t("products.noProducts")}</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product, idx) => (
                <ProductCard key={product._id} product={product} index={idx} />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
