import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import axios from "axios";
import { Clock, ArrowRight } from "lucide-react";
import { useRecentlyViewed } from "../hook/useRecentlyViewed";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function RecentlyViewed() {
  const { t } = useTranslation();
  const { getRecentlyViewed } = useRecentlyViewed();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const ids = getRecentlyViewed();
    if (ids.length === 0) return;

    axios.get(`${API}/products`).then(({ data }) => {
      const list = Array.isArray(data) ? data : [];
      const matched = ids.map((id) => list.find((p) => p._id === id)).filter(Boolean).slice(0, 4);
      setProducts(matched);
    }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (products.length === 0) return null;

  return (
    <section className="px-6 py-16 md:px-14 lg:px-24">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-[#557c6c]" />
          <h2 className="font-serif text-2xl">{t("home.recentlyViewed") || "Recently Viewed"}</h2>
        </div>
        <Link to="/products" className="group flex items-center gap-2 text-sm text-[#1b3b2f] transition-all hover:gap-4 dark:text-white">
          {t("home.viewAll")}
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <Link
            key={product._id}
            to={`/products/${product._id}`}
            className="group rounded-2xl bg-white dark:bg-[#161616] p-3 shadow-sm transition hover:shadow-md"
          >
            <div className="aspect-square rounded-xl bg-zinc-50 dark:bg-zinc-800 overflow-hidden mb-3">
              <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{product.name}</h3>
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-1">₹{product.price}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
