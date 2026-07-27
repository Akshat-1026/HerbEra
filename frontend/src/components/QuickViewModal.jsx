import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Heart,
  ShoppingCart,
  Star,
  Plus,
  Minus,
  Truck,
  ShieldCheck,
  BadgeCheck,
  Award,
  CheckCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  Zap,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hook/CartHook";
import { useWishlist } from "../context/WishlistContext";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../context/CurrencyContext";

export default function QuickViewModal({ product, isOpen, onClose }) {
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(
    product?.variants?.length > 0 ? product.variants[0] : null
  );
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !product) return null;

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const originalPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;
  const currentStock = selectedVariant ? (selectedVariant.countInStock ?? 0) : (product.countInStock ?? 0);
  const discountPercent = originalPrice > 0 && originalPrice > currentPrice
    ? Math.round((1 - currentPrice / originalPrice) * 100)
    : 0;
  const displayImages = product.images?.length ? product.images : [product.image];
  const avgRating = product.rating || 0;
  const reviewCount = product.numReviews || 0;
  const wishlisted = isInWishlist(product._id || product.id);

  const increase = () => setQty((p) => Math.min(p + 1, currentStock || 99));
  const decrease = () => { if (qty > 1) setQty((p) => p - 1); };

  const handleAddCart = () => {
    addToCart({ ...product, selectedVariant }, qty);
    toast.success(t("quickView.addedToCart"));
  };

  const handleBuyNow = () => {
    addToCart({ ...product, selectedVariant }, qty);
    onClose();
    navigate("/checkout");
  };

  return (
    <AnimatePresence>
      <motion.div
        key="quickview-overlay"
        className="fixed inset-0 z-[999] overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        {/* Backdrop — fixed to viewport, never scrolls */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

        {/* Centering — flex + min-h-full centers when fits, scrolls when taller */}
        <div className="relative z-10 flex min-h-full items-center justify-center px-4 pt-24 pb-10 sm:px-6">
          <motion.div
            className="w-full max-w-7xl flex flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#111] max-h-[calc(100vh-80px)]"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
          {/* Close Button — sticky so always visible */}
          <button
            onClick={onClose}
            className="sticky top-0 right-0 z-50 ml-auto mr-4 mt-4 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 shadow-md transition hover:bg-red-50 hover:text-red-500 hover:rotate-90 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
          >
            <X size={18} />
          </button>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
            <div className="flex flex-col lg:grid lg:grid-cols-[minmax(320px,2fr)_3fr]">

              {/* LEFT — Image Gallery */}
              <div className="relative bg-linear-to-br from-stone-50 to-emerald-50/30 dark:from-[#0a0a0a] dark:to-[#141414] flex flex-col items-center p-6 sm:p-8">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <img src="/images/productbackground.jpg" alt="" className="h-full w-full object-cover opacity-30" />
                </div>

                {/* Badges */}
                <div className="absolute left-6 top-6 z-10 flex flex-col gap-2">
                  {product.isBestseller && (
                    <span className="rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold text-white shadow-lg">
                      {t("quickView.bestSeller")}
                    </span>
                  )}
                  {product.isNewArrival && (
                    <span className="rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-bold text-white shadow-lg">
                      {t("quickView.new")}
                    </span>
                  )}
                </div>
                {discountPercent > 0 && (
                  <div className="absolute right-6 top-6 z-10">
                    <span className="rounded-full bg-red-500 px-3 py-1 text-[11px] font-bold text-white shadow-lg">
                      -{discountPercent}%
                    </span>
                  </div>
                )}

                {/* Main Image */}
                <div className="relative z-10 w-full mt-8">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={selectedImage}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      src={displayImages[selectedImage] || product.image}
                      alt={product.name}
                      className="mx-auto max-h-[50vh] w-auto max-w-full rounded-2xl object-contain"
                    />
                  </AnimatePresence>

                  {displayImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImage((p) => (p === 0 ? displayImages.length - 1 : p - 1))}
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-md backdrop-blur-sm transition hover:bg-white dark:bg-zinc-800/80 dark:hover:bg-zinc-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => setSelectedImage((p) => (p === displayImages.length - 1 ? 0 : p + 1))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-md backdrop-blur-sm transition hover:bg-white dark:bg-zinc-800/80 dark:hover:bg-zinc-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {displayImages.length > 1 && (
                  <div className="relative z-10 mt-4 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {displayImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                          selectedImage === idx
                            ? "border-emerald-600 shadow-md shadow-emerald-600/20"
                            : "border-transparent opacity-50 hover:opacity-100"
                        }`}
                      >
                        <img src={img} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT — Product Info */}
              <div className="flex flex-col gap-4 p-6 sm:p-8 lg:p-10">
                {/* Category + SKU */}
                <div className="flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
                  <span className="uppercase tracking-widest font-medium">{product.category}</span>
                  {product.sku && (
                    <>
                      <span className="text-zinc-300 dark:text-zinc-700">|</span>
                      <span className="font-mono">SKU: {product.sku}</span>
                    </>
                  )}
                </div>

                {/* Name */}
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-zinc-900 dark:text-white">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={16}
                        className={s <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-zinc-200 dark:text-zinc-700"}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{avgRating.toFixed(1)}</span>
                  <span className="text-sm text-zinc-400">({reviewCount} review{reviewCount !== 1 ? "s" : ""})</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-zinc-900 dark:text-white">{formatPrice(currentPrice)}</span>
                  {discountPercent > 0 && (
                    <>
                      <span className="text-lg text-zinc-400 line-through">{formatPrice(originalPrice)}</span>
                      <span className="rounded-lg bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        {discountPercent}% OFF
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {product.description}
                </p>

                {/* Variant Selector */}
                {product.variants?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">{t("quickView.selectVariant")}</p>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v, i) => (
                        <button
                          key={i}
                          onClick={() => { setSelectedVariant(v); setQty(1); }}
                          className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                            selectedVariant?.label === v.label
                              ? "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm dark:bg-emerald-900/20 dark:border-emerald-500 dark:text-emerald-300"
                              : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400"
                          }`}
                        >
                          {v.label} — {formatPrice(v.price)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock */}
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${currentStock > 0 ? "bg-emerald-500" : "bg-red-500"}`} />
                  <span className={`text-sm font-medium ${currentStock > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    {currentStock > 0 ? t("quickView.inStock") : t("quickView.outOfStock")}
                  </span>
                </div>

                {/* Quantity + Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-700 shrink-0">
                    <button
                      onClick={decrease}
                      disabled={qty <= 1}
                      className="flex h-10 w-10 items-center justify-center text-zinc-500 transition hover:text-zinc-900 disabled:opacity-30 dark:hover:text-white"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="flex h-10 w-10 items-center justify-center text-sm font-bold text-zinc-900 dark:text-white">
                      {qty}
                    </span>
                    <button
                      onClick={increase}
                      disabled={currentStock > 0 && qty >= currentStock}
                      className="flex h-10 w-10 items-center justify-center text-zinc-500 transition hover:text-zinc-900 disabled:opacity-30 dark:hover:text-white"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    onClick={handleAddCart}
                    disabled={currentStock < 1}
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShoppingCart size={16} />
                    {t("quickView.addToCart")}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={currentStock < 1}
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 text-sm font-bold text-white transition hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    <Zap size={14} />
                    {t("quickView.buyNow")}
                    <ArrowRight size={12} />
                  </button>

                  <button
                    onClick={() => toggleWishlist(product._id || product.id, product)}
                    className="flex h-11 w-11 items-center justify-center shrink-0 rounded-xl border border-zinc-200 text-zinc-500 transition hover:bg-red-50 hover:text-red-500 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    <Heart size={18} fill={wishlisted ? "#ef4444" : "none"} className={wishlisted ? "text-red-500" : ""} />
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-900/60">
                  <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <Truck size={14} className="text-emerald-600 shrink-0" />
                    <span>{t("quickView.freeDelivery")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <PackageCheck size={14} className="text-emerald-600 shrink-0" />
                    <span>{t("quickView.easyReturns")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                    <span>{t("quickView.securePayment")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <BadgeCheck size={14} className="text-emerald-600 shrink-0" />
                    <span>{t("quickView.authenticProduct")}</span>
                  </div>
                </div>

                {/* Benefits */}
                {product.benefits?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">{t("quickView.keyBenefits")}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {product.benefits.slice(0, 4).map((b, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-xl bg-emerald-50/80 px-3 py-2 text-xs text-zinc-700 dark:bg-emerald-900/10 dark:text-zinc-300">
                          <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                          {b}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {product.certifications?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {product.certifications.map((cert, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:border-amber-800/30 dark:bg-amber-900/15 dark:text-amber-400">
                        <Award size={11} />
                        {cert}
                      </span>
                    ))}
                  </div>
                )}

                {/* View Full Details */}
                <Link
                  to={`/products/${product._id || product.id}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 transition hover:gap-3 hover:underline dark:text-emerald-400"
                >
                  {t("quickView.viewFullDetails")}
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
