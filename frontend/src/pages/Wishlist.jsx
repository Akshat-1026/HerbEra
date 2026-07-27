import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Trash2, ArrowLeft, Sparkles, Share2 } from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useCart } from "../hook/CartHook";
import { useWishlist } from "../context/WishlistContext";
import SEO from "../components/SEO";
import { useCurrency } from "../context/CurrencyContext";

function Wishlist() {
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    const resolveItems = async () => {
      setLoading(true);
      const hasObjects = wishlist.some((item) => typeof item === "object" && item._id);

      if (hasObjects) {
        setItems(wishlist);
        setLoading(false);
        return;
      }

      const ids = wishlist.filter((id) => typeof id === "string");
      if (ids.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/products`);
        const matched = data.filter((p) => ids.includes(p._id));
        setItems(matched);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    resolveItems();
  }, [wishlist]);

  const handleRemove = async (productId) => {
    await removeFromWishlist(productId);
    toast.error(t("wishlist.removed"));
  };

  const handleAddToCart = async (product) => {
    setAddingId(product._id);
    setTimeout(() => {
      addToCart(product);
      toast.success(t("wishlist.addedToCart", { name: product.name }));
      setAddingId(null);
    }, 300);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-green-50 dark:from-zinc-950 dark:to-zinc-900">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-2 border-green-600/20 border-t-green-600" />
          <Heart size={24} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-green-600" />
        </div>
      </div>
    );
  }

  return (
    <>
    <SEO title={t("wishlist.pageTitle")} />
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-green-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">

        {/* Header */}
        <div className="mb-10 sm:mb-14">
          <nav className="mb-6 text-sm text-zinc-400">
            <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-zinc-600 dark:text-zinc-300">{t("wishlist.pageTitle")}</span>
          </nav>
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 shadow-sm">
                <Heart className="text-green-600 dark:text-green-400" size={22} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-800 dark:text-white">
                  {t("wishlist.heading")}
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {t("wishlist.count", { count: items.length })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={() => {
                    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
                    const sharedUrl = `${window.location.origin}/wishlist/shared/${userInfo._id || ""}`;
                    navigator.clipboard.writeText(sharedUrl);
                    toast.success("Wishlist link copied!");
                  }}
                  className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 transition-colors"
                  title="Share wishlist"
                >
                  <Share2 size={14} />
                  Share
                </button>
              )}
              {items.length > 0 && (
                <button
                  onClick={() => items.forEach((p) => handleRemove(p._id))}
                  className="text-xs text-red-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                  Clear All
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 h-px bg-gradient-to-r from-green-200/50 via-zinc-200 to-transparent dark:from-green-800/30 dark:via-zinc-700" />
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/20 py-24 px-6 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-700">
              <Heart size={36} className="text-zinc-300 dark:text-zinc-500" />
            </div>
            <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{t("wishlist.empty")}</h2>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-8 max-w-sm mx-auto">
              Items added to your wishlist will appear here. Start browsing our collection.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-7 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:from-green-700 hover:to-emerald-700 active:scale-[0.98]"
            >
              <Sparkles size={16} />
              {t("wishlist.browseProducts")}
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Showing <span className="font-semibold text-zinc-700 dark:text-zinc-300">{items.length}</span> saved {items.length === 1 ? "item" : "items"}
              </p>
            </div>
            <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
                  onClick={() => navigate(`/products/${product._id}`)}
                  className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all hover:shadow-xl hover:border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-zinc-50 dark:bg-zinc-800">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemove(product._id); }}
                      className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm text-zinc-400 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-50 hover:text-red-500 dark:bg-zinc-800/80 dark:hover:bg-red-900/30"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="absolute left-3 top-3">
                      <span className="inline-block rounded-full bg-white/90 dark:bg-zinc-800/90 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-green-700 dark:text-green-400 shadow-sm">
                        {product.category || t("wishlist.category")}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-1.5 p-4">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 group-hover:text-green-700 dark:text-zinc-100 dark:group-hover:text-green-400 transition-colors">
                      {product.name}
                    </h3>

                    {product.rating > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(product.rating) ? "text-amber-400" : "text-zinc-200 dark:text-zinc-600"}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-[11px] text-zinc-400">({product.numReviews || 0})</span>
                      </div>
                    )}

                    <p className="line-clamp-2 text-xs leading-relaxed text-zinc-400 dark:text-zinc-500">
                      {product.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-2">
                      <span className="text-lg font-bold text-zinc-800 dark:text-white">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice > 0 && (
                        <span className="text-xs text-zinc-400 line-through">{formatPrice(product.originalPrice)}</span>
                      )}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                        disabled={addingId === product._id}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-md hover:from-green-700 hover:to-emerald-700 active:scale-[0.97] disabled:opacity-60"
                      >
                        {addingId === product._id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                          <>
                            <ShoppingCart size={14} />
                            {t("wishlist.addToCart")}
                          </>
                        )}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemove(product._id); }}
                        className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-2.5 text-zinc-400 transition-all hover:border-red-200 hover:text-red-500 hover:bg-red-50 dark:hover:border-red-800 dark:hover:bg-red-900/20"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {items.length > 0 && (
          <div className="mt-14 text-center">
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 text-sm font-medium text-green-600 transition-all hover:gap-3 dark:text-green-400"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              {t("wishlist.continueShopping")}
            </Link>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default Wishlist;
