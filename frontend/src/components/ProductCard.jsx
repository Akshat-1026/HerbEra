import { useState } from "react";
import { Heart, ShoppingCart, Star, Eye, Zap, Scale } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useCart } from "../hook/CartHook";
import { useWishlist } from "../context/WishlistContext";
import { useCompare } from "../context/CompareContext";
import { useTranslation } from "react-i18next";

const stagger = (i = 0, d = 0.07) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.35, delay: i * d, ease: "easeOut" },
});

function StarRating({ rating, count }) {
  const stars = Math.round(rating || 0);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={13}
            className={s <= stars ? "fill-amber-400 text-amber-400" : "text-zinc-300 dark:text-zinc-600"}
          />
        ))}
      </div>
      {count != null && (
        <span className="text-xs text-zinc-400 dark:text-zinc-500">({count})</span>
      )}
    </div>
  );
}

function ProductCard({
  product,
  index = 0,
  showDescription = true,
  showQuickView = false,
  showRating = true,
  showPrice = true,
  showBadges = true,
  onQuickView,
  className = "",
}) {
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { t } = useTranslation();
  const isWishlisted = isInWishlist(product._id);
  const hasVariants = product.variants?.length > 0;
  const [selectedVariant, setSelectedVariant] = useState(hasVariants ? product.variants[0] : null);
  const inStock = hasVariants ? (selectedVariant?.countInStock ?? 0) > 0 : (product.countInStock ?? 0) > 0;

  const getDiscountPercent = () => {
    if (selectedVariant?.originalPrice > 0) {
      return Math.round((1 - selectedVariant.price / selectedVariant.originalPrice) * 100);
    }
    if (!hasVariants && product.originalPrice > 0) {
      return Math.round((1 - product.price / product.originalPrice) * 100);
    }
    return 0;
  };
  const discountPercent = getDiscountPercent();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    const existing = cart.find((item) => item._id === product._id);
    addToCart({ ...product, selectedVariant });
    toast.success(existing ? `${product.name} ${t("productCard.quantityIncreased")}` : `${product.name} ${t("productCard.addedToCart")}`);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product._id, product);
    toast.success(isWishlisted ? t("productCard.removedFromWishlist") : t("productCard.addedToWishlist"));
  };

  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const inCompare = isInCompare(product._id);
  const handleCompare = (e) => {
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(product._id);
      toast("Removed from compare");
    } else {
      const result = addToCompare(product);
      toast[result.success ? "success" : "error"](result.message);
      if (result.success) navigate("/compare");
    }
  };

  return (
    <motion.div
      {...stagger(index)}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => navigate(`/products/${product._id}`)}
      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {showBadges && (
          <div className="absolute left-0 top-0 z-10 flex flex-col gap-1 p-2">
            {!inStock && (
              <span className="rounded-sm bg-red-600 px-2 py-0.5 text-[11px] font-bold uppercase leading-none text-white shadow-sm">
                {t("productCard.outOfStock")}
              </span>
            )}
            {inStock && product.isBestseller && (
              <span className="rounded-sm bg-amber-500 px-2 py-0.5 text-[11px] font-bold uppercase leading-none text-white shadow-sm">
                {t("productCard.bestSeller")}
              </span>
            )}
            {inStock && product.isNewArrival && (
              <span className="rounded-sm bg-emerald-600 px-2 py-0.5 text-[11px] font-bold uppercase leading-none text-white shadow-sm">
                {t("productCard.new")}
              </span>
            )}
          </div>
        )}

        <button
          onClick={handleCompare}
          className="absolute right-10 top-2 z-10 rounded-full bg-white/80 p-1.5 shadow-sm backdrop-blur-sm transition hover:bg-white dark:bg-zinc-800/80 dark:hover:bg-zinc-800"
          title={inCompare ? "Remove from compare" : "Add to compare"}
        >
          <Scale
            size={15}
            className={`transition-colors ${inCompare ? "text-blue-500" : "text-zinc-500 dark:text-zinc-400"}`}
          />
        </button>

        <button
          onClick={handleWishlist}
          className="absolute right-2 top-2 z-10 rounded-full bg-white/80 p-1.5 shadow-sm backdrop-blur-sm transition hover:bg-white dark:bg-zinc-800/80 dark:hover:bg-zinc-800"
        >
          <Heart
            size={15}
            className={`transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-zinc-500 dark:text-zinc-400"}`}
          />
        </button>

        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        {showQuickView && inStock && (
          <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center bg-gradient-to-t from-black/60 to-transparent pt-8 pb-3 transition-transform duration-300 group-hover:translate-y-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView?.(product);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-zinc-800 shadow-lg transition hover:bg-zinc-100"
            >
              <Eye size={14} />
              {t("productCard.quickView")}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        {/* Category & SKU */}
        <div className="flex items-center justify-between">
          <Link
            to={`/products/category/${encodeURIComponent(product.category || "ayurvedic")}`}
            onClick={(e) => e.stopPropagation()}
            className="text-[11px] font-medium uppercase tracking-wider text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            {product.category || t("productCard.ayurvedic")}
          </Link>
          {product.sku && (
            <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">{product.sku}</p>
          )}
        </div>

        {/* Name */}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 group-hover:text-emerald-700 dark:text-zinc-100 dark:group-hover:text-emerald-400">
          {product.name}
          {discountPercent > 0 && (
            <span className="ml-1.5 inline-block rounded-sm bg-red-500 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-white">
              {discountPercent}% OFF
            </span>
          )}
        </h3>

        {/* Rating */}
        {showRating && (
          <StarRating rating={product.rating} count={product.numReviews} />
        )}

        {/* Description */}
        {showDescription && (
          <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            {product.description}
          </p>
        )}

        {/* Price */}
        {showPrice && (
          <div className="mt-auto flex items-baseline gap-1.5 pt-1">
            {selectedVariant ? (
              <>
                <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  ₹{selectedVariant.price}
                </span>
                {selectedVariant.originalPrice > 0 && (
                  <span className="text-xs text-zinc-400 line-through dark:text-zinc-500">
                    ₹{selectedVariant.originalPrice}
                  </span>
                )}
              </>
            ) : hasVariants ? (
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                ₹{Math.min(...product.variants.map(v => v.price))} – ₹{Math.max(...product.variants.map(v => v.price))}
              </span>
            ) : (
              <>
                <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  ₹{product.price}
                </span>
                {product.originalPrice > 0 && (
                  <span className="text-xs text-zinc-400 line-through dark:text-zinc-500">
                    ₹{product.originalPrice}
                  </span>
                )}
              </>
            )}
          </div>
        )}

        {/* Variant selector */}
        {hasVariants && (
          <div className="mt-1 flex flex-wrap gap-1">
            {product.variants.map((v) => (
              <button
                key={v.label}
                onClick={(e) => { e.stopPropagation(); setSelectedVariant(v); }}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                  selectedVariant?.label === v.label
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-1.5 flex gap-1.5">
          <button
            disabled={!inStock}
            onClick={(e) => {
              e.stopPropagation();
              const payload = selectedVariant ? { ...product, selectedVariant } : product;
              addToCart(payload);
              navigate("/checkout");
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
              inStock
                ? "bg-[#2d5c49] text-white hover:bg-[#1a362b] active:scale-[0.97]"
                : "cursor-not-allowed bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
            }`}
          >
            <Zap size={14} />
            Buy Now
          </button>
          {inStock && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(e);
              }}
              className="flex items-center justify-center gap-1 rounded-lg border border-emerald-600 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 active:scale-[0.97] dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
            >
              <ShoppingCart size={14} />
              {t("productCard.addToCart")}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ProductCard;
