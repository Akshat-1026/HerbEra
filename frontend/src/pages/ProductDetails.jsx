import { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../hook/CartHook";
import { useWishlist } from "../context/WishlistContext";
import { Heart, Star, Truck, ShieldCheck, ArrowRight, ChevronLeft, ChevronRight, CheckCircle, XCircle, Award, BookOpen, FlaskConical, Clock, Send, Loader2, Minus, Plus, ShoppingCart, Zap, PackageCheck, Play, ThumbsUp, Flag, BadgeCheck, ImageIcon, SlidersHorizontal, ChevronDown, X, Camera } from "lucide-react";
import { useRecentlyViewed } from "../hook/useRecentlyViewed";
import { toast } from "react-toastify";
import SEO from "../components/SEO";
import { AuthContext } from "../context/AuthContext";
import ImageZoom from "../components/ImageZoom";
import api from "../services/api";
import { resizeImage } from "../utils/resizeImage";
import useProductTranslation from "../hook/useProductTranslation";
import Picture from "../components/Picture";
import { useCurrency } from "../context/CurrencyContext";

const SkeletonLoader = () => (
  <div className="min-h-screen bg-zinc-50 px-6 py-16 dark:bg-zinc-950">
    <div className="mx-auto max-w-7xl">
      <div className="h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse mb-8" />
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="aspect-[4/5] w-full rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="space-y-6 pt-4">
          <div className="h-6 w-32 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="h-10 w-3/4 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="h-12 w-40 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="h-32 w-full rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="h-14 w-full rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

function StarDisplay({ rating, size = 14 }) {
  const stars = Math.round(rating || 0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size} className={s <= stars ? "fill-amber-400 text-amber-400" : "text-zinc-300 dark:text-zinc-600"} />
      ))}
    </div>
  );
}

function ProductDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isAuthenticated } = useContext(AuthContext);
  const { formatPrice } = useCurrency();

  const [product, setProduct] = useState(null);
  const tp = useProductTranslation(product);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeTab, setActiveTab] = useState("description");

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [reviewSort, setReviewSort] = useState("newest");
  const [reviewFilter, setReviewFilter] = useState(0);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [helpfulLoading, setHelpfulLoading] = useState(null);
  const { addRecentlyViewed } = useRecentlyViewed();

  const fetchReviews = async (productId, page = 1, sort = "newest", ratingFilter = 0, append = false) => {
    try {
      setLoadingReviews(true);
      const params = new URLSearchParams({ page: String(page), limit: "10", sort });
      if (ratingFilter > 0) params.set("rating", String(ratingFilter));
      const { data } = await api.get(`/reviews/product/${productId}?${params}`);
      setReviews((prev) => (append ? [...prev, ...data.reviews] : data.reviews));
      setReviewTotalPages(data.totalPages || 1);
      setReviewPage(data.page || 1);
    } catch {
      if (!append) setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchStats = async (productId) => {
    try {
      const { data } = await api.get(`/reviews/product/${productId}/stats`);
      setReviewStats(data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchProductData = async () => {
      try {
        setLoading(true);
        const productRes = await api.get(`/products/${id}`);
        const data = productRes.data?.data || productRes.data?.product || productRes.data || null;

        if (isMounted && data) {
          setProduct(data);
          if (data.variants?.length > 0) setSelectedVariant(data.variants[0]);

          try {
            const relatedRes = await api.get(`/products/search?sort=newest&limit=5&page=1`);
            const relatedData = relatedRes.data?.products || relatedRes.data?.data || [];
            setRelatedProducts(relatedData.filter((p) => p._id !== data._id).slice(0, 4));
          } catch {
            setRelatedProducts([]);
          }

          addRecentlyViewed(data._id);
        }
      } catch {
        if (isMounted) setError(t("productDetails.errorLoad"));
      } finally {
        setTimeout(() => { if (isMounted) setLoading(false); }, 800);
      }
    };

    fetchProductData();
    return () => { isMounted = false; };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!id) return;
    fetchReviews(id, 1, reviewSort, reviewFilter, false);
    fetchStats(id);
  }, [id, reviewSort, reviewFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const payload = { rating: reviewRating, comment: reviewComment, images: reviewImages };
      if (editingReview) {
        await api.put(`/reviews/${editingReview._id}`, payload);
        toast.success(t("productDetails.reviewUpdated"));
      } else {
        await api.post(`/reviews/product/${id}`, payload);
        toast.success(t("productDetails.reviewSubmitted"));
      }
      setReviewComment("");
      setReviewRating(5);
      setReviewImages([]);
      setEditingReview(null);
      fetchReviews(id, 1, reviewSort, reviewFilter, false);
      fetchStats(id);
    } catch (err) {
      toast.error(err.response?.data?.message || t("productDetails.errorReview"));
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleToggleHelpful = async (reviewId) => {
    setHelpfulLoading(reviewId);
    try {
      const { data } = await api.post(`/reviews/${reviewId}/helpful`);
      setReviews((prev) => prev.map((r) => r._id === reviewId ? { ...r, helpfulCount: data.helpfulCount, _isHelpful: data.isHelpful } : r));
    } catch { /* ignore */ }
    setHelpfulLoading(null);
  };

  const handleReport = async (reviewId) => {
    try {
      await api.post(`/reviews/${reviewId}/report`, { reason: "Inappropriate" });
      toast.success(t("productDetails.reviewReported"));
      setReviews((prev) => prev.map((r) => r._id === reviewId ? { ...r, isReported: true } : r));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to report");
    }
  };

  const handleReviewImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (reviewImages.length + files.length > 5) {
      toast.error("Max 5 images");
      return;
    }
    try {
      const resized = await Promise.all(files.map((f) => resizeImage(f, { width: 800, height: 800, quality: 0.8 })));
      setReviewImages((prev) => [...prev, ...resized]);
    } catch {
      toast.error("Failed to process images");
    }
    e.target.value = "";
  };

  const isWishlisted = wishlist?.some((item) =>
    typeof item === "string" ? item === product?._id : item._id === product?._id
  );
  const currentPrice = selectedVariant ? selectedVariant.price : product?.price;
  const originalPrice = selectedVariant ? selectedVariant.originalPrice : product?.originalPrice;
  const discountPercent = originalPrice > 0 && originalPrice > currentPrice ? Math.round((1 - currentPrice / originalPrice) * 100) : 0;
  const currentStock = selectedVariant ? (selectedVariant.countInStock ?? 0) : (product?.countInStock ?? 0);
  const displayImages = product?.images?.length ? product.images : [product?.image];
  const avgRating = reviewStats.average || product?.rating || 0;
  const reviewCount = reviewStats.total || reviews.length || product?.numReviews || 0;
  const userReview = reviews.find((r) => r.user?.name && isAuthenticated && r._currentUser);

  const handleWishlistToggle = async () => {
    setActionLoading(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist(product._id);
        toast(t("productDetails.removedFromWishlist"));
      } else {
        await addToWishlist(product._id, product);
        toast.success(t("productDetails.savedToWishlist"));
      }
    } catch {
      toast.error(t("productDetails.errorWishlist"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddToCart = async () => {
    setActionLoading(true);
    try {
      addToCart({ ...product, selectedVariant }, quantity);
      toast.success(t("productDetails.addedToCart", { name: product.name }));
    } catch {
      toast.error(t("productDetails.errorAddToCart"));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <SkeletonLoader />;
  if (error) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-6xl mb-4">🌿</p>
        <p className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">{error}</p>
        <Link to="/products" className="mt-4 inline-block text-sm text-emerald-600 hover:underline">{t("productDetails.shop")}</Link>
      </div>
    </div>
  );
  if (!product) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-6xl mb-4">🔍</p>
        <p className="text-xl font-semibold text-zinc-500">{t("productDetails.productNotFound")}</p>
        <Link to="/products" className="mt-4 inline-block text-sm text-emerald-600 hover:underline">{t("productDetails.shop")}</Link>
      </div>
    </div>
  );

  const tabs = [
    { key: "description", label: t("productDetails.tabDescription"), icon: BookOpen },
    { key: "benefits", label: t("productDetails.tabBenefits"), icon: CheckCircle },
    { key: "ingredients", label: t("productDetails.tabIngredients"), icon: FlaskConical },
    { key: "usage", label: t("productDetails.tabUsage"), icon: Clock },
    { key: "certifications", label: t("productDetails.tabCertifications"), icon: Award },
  ];

  return (
    <>
      <SEO title={product.name} description={product.description} />
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-zinc-400 flex items-center gap-1.5">
          <Link to="/" className="hover:text-emerald-600 transition-colors">{t("productDetails.home")}</Link>
          <ChevronRight size={12} />
          <Link to="/products" className="hover:text-emerald-600 transition-colors">{t("productDetails.shop")}</Link>
          <ChevronRight size={12} />
          <span className="text-zinc-600 dark:text-zinc-300 truncate font-medium">{tp.name}</span>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-8 lg:grid lg:grid-cols-2 lg:gap-14">
          {/* Image Gallery */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative mb-4 overflow-hidden rounded-2xl" style={{ backgroundImage: "url(/images/productbackground.webp)", backgroundSize: "cover", backgroundPosition: "center" }}>
              <div className="aspect-square flex items-center justify-center p-8">
                {currentStock < 1 && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm dark:bg-black/70">
                    <span className="rounded-full bg-red-600 px-8 py-3 text-lg font-bold text-white tracking-widest uppercase shadow-xl">{t("productDetails.soldOut")}</span>
                  </div>
                )}
                <AnimatePresence mode="wait">
                  {showVideo && product.video ? (
                    <motion.div
                      key="video"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <iframe
                        src={product.video}
                        title="Product video"
                        className="w-full h-full rounded-lg"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={selectedImage}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full"
                    >
                      <ImageZoom
                        src={displayImages[selectedImage] || "/placeholder.jpg"}
                        alt={product.name}
                        className="max-h-full w-full"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Image Nav Arrows */}
                {displayImages.length > 1 && !showVideo && (
                  <>
                    <button
                      onClick={() => setSelectedImage((p) => (p === 0 ? displayImages.length - 1 : p - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-lg backdrop-blur-sm transition hover:bg-white dark:bg-zinc-800/80 dark:hover:bg-zinc-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setSelectedImage((p) => (p === displayImages.length - 1 ? 0 : p + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-lg backdrop-blur-sm transition hover:bg-white dark:bg-zinc-800/80 dark:hover:bg-zinc-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {displayImages.length > 1 && !showVideo && (
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                    {selectedImage + 1} / {displayImages.length}
                  </span>
                )}
              </div>
            </div>

            {displayImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSelectedImage(idx); setShowVideo(false); }}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 object-cover transition-all ${
                      selectedImage === idx && !showVideo ? "border-emerald-600 shadow-md shadow-emerald-600/10" : "border-zinc-200 dark:border-zinc-700 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover bg-white" />
                  </button>
                ))}
                {product.video && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 flex items-center justify-center transition-all ${
                      showVideo ? "border-emerald-600 shadow-md shadow-emerald-600/10 bg-emerald-50" : "border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Play size={20} className="text-emerald-600" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col pt-4 lg:pt-0">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {product.isNewArrival && (
                <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">{t("productDetails.new")}</span>
              )}
              {product.isBestseller && (
                <span className="rounded-full bg-amber-100 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">{t("productDetails.bestSeller")}</span>
              )}
              <span className={`rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                currentStock > 0
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                  : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
              }`}>
                {currentStock > 0 ? t("productDetails.inStock") : t("productDetails.outOfStock")}
              </span>
            </div>

            {/* Name */}
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl lg:text-4xl leading-tight">
              {tp.name}
            </h1>

            {/* Rating */}
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <StarDisplay rating={avgRating} />
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{avgRating}</span>
              </div>
              <span className="text-xs text-zinc-400">|</span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">{reviewCount} review{reviewCount !== 1 ? "s" : ""}</span>
            </div>

            {/* Price */}
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-4xl font-black text-zinc-900 dark:text-white">{formatPrice(currentPrice)}</span>
              {discountPercent > 0 && (
                <>
                  <span className="text-xl text-zinc-400 line-through">{formatPrice(originalPrice)}</span>
                  <span className="rounded-lg bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">{discountPercent}% OFF</span>
                </>
              )}
            </div>

            {/* Short Description */}
            {tp.description && (
              <p className="mt-5 leading-relaxed text-zinc-600 dark:text-zinc-400 text-sm border-l-2 border-emerald-200 dark:border-emerald-800 pl-4">
                {tp.description}
              </p>
            )}

            {/* Divider */}
            <hr className="my-6 border-zinc-100 dark:border-zinc-800" />

            {/* Variant Selector */}
            {product.variants?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {product.variants.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedVariant(v); setQuantity(1); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                      selectedVariant === v
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-500 dark:text-emerald-300"
                        : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400"
                    }`}
                  >
                    {v.label} — {formatPrice(v.price)}
                  </button>
                ))}
              </div>
            )}

            {/* Quantity + Total */}
            <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
              <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-600">
                <button
                  onClick={() => setQuantity((p) => Math.max(1, p - 1))}
                  className="flex h-10 w-10 items-center justify-center text-zinc-500 transition hover:text-zinc-900 dark:hover:text-white"
                >
                  <Minus size={16} />
                </button>
                <span className="flex h-10 w-10 items-center justify-center text-sm font-semibold text-zinc-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((p) => (p < currentStock ? p + 1 : p))}
                  className="flex h-10 w-10 items-center justify-center text-zinc-500 transition hover:text-zinc-900 dark:hover:text-white"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                <span className="font-bold text-zinc-900 dark:text-white">{formatPrice(currentPrice * quantity)}</span>
                <span className="ml-1">{quantity > 1 ? `for ${quantity}` : "each"}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={actionLoading || currentStock < 1}
                className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
                {t("productDetails.addToCart")}
              </button>

              <button
                onClick={handleWishlistToggle}
                disabled={actionLoading}
                className="flex h-14 w-14 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 active:scale-[0.98]"
              >
                <Heart size={20} fill={isWishlisted ? "#ef4444" : "none"} className={isWishlisted ? "text-red-500" : ""} />
              </button>
            </div>

            <button
              onClick={async () => {
                setActionLoading(true);
                try {
                  addToCart({ ...product, selectedVariant }, quantity);
                  navigate("/checkout");
                } catch {
                  toast.error(t("productDetails.errorAddToCart"));
                  setActionLoading(false);
                }
              }}
              disabled={actionLoading || currentStock < 1}
              className="mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 text-sm font-bold text-white transition hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Zap size={18} />
              {t("productDetails.buyItNow")}
              <ArrowRight size={16} />
            </button>

            {/* Trust Badges */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
              <div className="flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
                <Truck size={18} className="text-emerald-600 shrink-0" />
                <span>{t("productDetails.freeShipping")}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
                <PackageCheck size={18} className="text-emerald-600 shrink-0" />
                <span>{t("productDetails.easyReturns")}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
                <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                <span>{t("productDetails.secureCheckout")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="border-t border-zinc-100 dark:border-zinc-800">
          <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="flex gap-0 border-b border-zinc-200 dark:border-zinc-700 overflow-x-auto">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-5 pb-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 -mb-[1px] ${
                    activeTab === key
                      ? "border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400"
                      : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <AnimatePresence mode="wait">
                {activeTab === "description" && (
                  <motion.div key="description" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                    <div className="max-w-3xl">
                      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 whitespace-pre-line">{tp.description}</p>
                    </div>
                    <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
                        <p className="text-xs text-zinc-400 uppercase tracking-wider">{t("productDetails.brand")}</p>
                        <p className="mt-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200">{product.brand || t("productDetails.brandValue")}</p>
                      </div>
                      <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
                        <p className="text-xs text-zinc-400 uppercase tracking-wider">{t("productDetails.category")}</p>
                        <p className="mt-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200">{product.category || t("productDetails.categoryValue")}</p>
                      </div>
                      <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
                        <p className="text-xs text-zinc-400 uppercase tracking-wider">{t("productDetails.sku")}</p>
                        <p className="mt-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200 font-mono">{product.sku || t("productDetails.skuNa")}</p>
                      </div>
                      <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
                        <p className="text-xs text-zinc-400 uppercase tracking-wider">{t("productDetails.shelfLife")}</p>
                        <p className="mt-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200">{product.expiryDate || t("productDetails.shelfLifeValue")}</p>
                      </div>
                    </div>
                    {tp.sideEffects && (
                      <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800/30 dark:bg-red-900/10">
                        <p className="flex items-center gap-2 text-xs font-semibold text-red-700 dark:text-red-400">
                          <XCircle size={14} /> {t("productDetails.sideEffects")}
                        </p>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{tp.sideEffects}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "benefits" && (
                  <motion.div key="benefits" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                    {tp.benefits?.length > 0 ? (
                      <div className="grid sm:grid-cols-2 gap-3 max-w-3xl">
                        {tp.benefits.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                            <CheckCircle size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                            <span className="text-sm text-zinc-700 dark:text-zinc-300">{item}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400">{t("productDetails.benefitsComingSoon")}</p>
                    )}
                  </motion.div>
                )}

                {activeTab === "ingredients" && (
                  <motion.div key="ingredients" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                    {tp.ingredients?.length > 0 ? (
                      <ul className="space-y-2 max-w-xl">
                        {tp.ingredients.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-zinc-400">{t("productDetails.ingredientsComingSoon")}</p>
                    )}
                  </motion.div>
                )}

                {activeTab === "usage" && (
                  <motion.div key="usage" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                    {tp.usageInstructions ? (
                      <div className="max-w-2xl rounded-xl bg-emerald-50 p-6 dark:bg-emerald-900/10">
                        <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                          <Clock size={16} /> {t("productDetails.usageHeading")}
                        </p>
                        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{tp.usageInstructions}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400">{t("productDetails.usageComingSoon")}</p>
                    )}
                  </motion.div>
                )}

                {activeTab === "certifications" && (
                  <motion.div key="certifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                    {product.certifications?.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {product.certifications.map((cert, idx) => (
                          <span key={idx} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 dark:border-amber-800/30 dark:bg-amber-900/20 dark:text-amber-300">
                            <Award size={14} />
                            {cert}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400">{t("productDetails.certificationsComingSoon")}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t border-zinc-100 dark:border-zinc-800">
          <div className="mx-auto max-w-7xl px-4 py-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-8">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">{t("productDetails.customerReviews")}</h2>
                <div className="flex items-center gap-2">
                  <StarDisplay rating={avgRating} size={16} />
                  <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{avgRating}</span>
                  <span className="text-xs text-zinc-400">({reviewCount} {reviewCount === 1 ? "review" : "reviews"})</span>
                </div>
              </div>
            </div>

            {/* Star Distribution + Sort */}
            <div className="grid gap-8 lg:grid-cols-[280px_1fr] mb-8">
              {/* Distribution */}
              {reviewStats.total > 0 && (
                <div className="space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviewStats.distribution[star] || 0;
                    const pct = reviewStats.total > 0 ? Math.round((count / reviewStats.total) * 100) : 0;
                    const isActive = reviewFilter === star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewFilter(isActive ? 0 : star)}
                        className={`flex items-center gap-2 w-full group transition ${isActive ? "opacity-100" : "opacity-70 hover:opacity-100"}`}
                      >
                        <span className="text-xs font-medium text-zinc-500 w-3">{star}</span>
                        <Star size={12} className="fill-amber-400 text-amber-400 shrink-0" />
                        <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                          <div className="h-full rounded-full bg-amber-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-zinc-400 w-8 text-right">{count}</span>
                      </button>
                    );
                  })}
                  {reviewFilter > 0 && (
                    <button onClick={() => setReviewFilter(0)} className="text-xs text-emerald-600 hover:underline mt-1">
                      {t("productDetails.clearFilter")}
                    </button>
                  )}
                </div>
              )}

              {/* Sort + Reviews */}
              <div>
                {/* Sort Bar */}
                <div className="flex items-center gap-2 mb-4">
                  <SlidersHorizontal size={14} className="text-zinc-400" />
                  <select
                    value={reviewSort}
                    onChange={(e) => setReviewSort(e.target.value)}
                    className="text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="newest">{t("productDetails.sortNewest")}</option>
                    <option value="highest">{t("productDetails.sortHighest")}</option>
                    <option value="lowest">{t("productDetails.sortLowest")}</option>
                    <option value="helpful">{t("productDetails.sortHelpful")}</option>
                  </select>
                </div>

                {/* Review List */}
                {loadingReviews && reviews.length === 0 ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="rounded-xl border border-zinc-100 dark:border-zinc-800 p-5 animate-pulse">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-9 w-9 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                          <div className="space-y-1.5"><div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-700" /><div className="h-2.5 w-16 rounded bg-zinc-100 dark:bg-zinc-800" /></div>
                        </div>
                        <div className="h-3 w-full rounded bg-zinc-100 dark:bg-zinc-800 mb-1.5" />
                        <div className="h-3 w-3/4 rounded bg-zinc-100 dark:bg-zinc-800" />
                      </div>
                    ))}
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review._id} className="rounded-xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 transition hover:shadow-sm">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                              {(review.user?.name || "A").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{review.user?.name || "Anonymous"}</p>
                                {review.isVerifiedPurchase && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
                                    <BadgeCheck size={10} /> {t("productDetails.verifiedPurchase")}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-zinc-400">{new Date(review.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</p>
                            </div>
                          </div>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={12} className={s <= review.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200 dark:text-zinc-700"} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">{review.comment}</p>

                        {review.images?.length > 0 && (
                          <div className="flex gap-2 mb-3 overflow-x-auto">
                            {review.images.map((img, i) => (
                              <img key={i} src={img} alt="" className="h-16 w-16 rounded-lg object-cover border border-zinc-100 dark:border-zinc-800" />
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-3 pt-2 border-t border-zinc-50 dark:border-zinc-800/50">
                          <button
                            onClick={() => handleToggleHelpful(review._id)}
                            disabled={helpfulLoading === review._id}
                            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-emerald-600 transition disabled:opacity-50"
                          >
                            <ThumbsUp size={12} className={review._isHelpful ? "fill-emerald-500 text-emerald-500" : ""} />
                            {review.helpfulCount > 0 && <span>{review.helpfulCount}</span>}
                            <span className="hidden sm:inline">{t("productDetails.helpful")}</span>
                          </button>
                          {!review.isReported ? (
                            <button
                              onClick={() => handleReport(review._id)}
                              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-red-500 transition"
                            >
                              <Flag size={12} />
                              <span className="hidden sm:inline">{t("productDetails.report")}</span>
                            </button>
                          ) : (
                            <span className="text-xs text-zinc-300 dark:text-zinc-600">{t("productDetails.reported")}</span>
                          )}
                        </div>
                      </div>
                    ))}

                    {reviewPage < reviewTotalPages && (
                      <button
                        onClick={() => fetchReviews(id, reviewPage + 1, reviewSort, reviewFilter, true)}
                        disabled={loadingReviews}
                        className="w-full py-2.5 text-sm font-medium text-emerald-600 border border-emerald-200 dark:border-emerald-800 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition disabled:opacity-50"
                      >
                        {loadingReviews ? <Loader2 size={16} className="animate-spin mx-auto" /> : t("productDetails.loadMore")}
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">{t("productDetails.noReviews")}</p>
                )}
              </div>
            </div>

            {/* Write Review */}
            {isAuthenticated ? (
              <div className="max-w-xl border-t border-zinc-100 dark:border-zinc-800 pt-8">
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
                  {editingReview ? t("productDetails.editReview") : t("productDetails.writeReview")}
                </h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">{t("productDetails.yourRating")}</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setReviewRating(star)} className="transition hover:scale-110">
                        <Star size={20} className={star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-zinc-200 dark:text-zinc-700"} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder={t("productDetails.reviewPlaceholder")}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500 resize-none"
                  />
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-emerald-600 cursor-pointer transition">
                      <Camera size={14} />
                      <span>{reviewImages.length}/5</span>
                      <input type="file" accept="image/*" multiple onChange={handleReviewImageUpload} className="hidden" />
                    </label>
                    {editingReview && (
                      <button type="button" onClick={() => { setEditingReview(null); setReviewComment(""); setReviewRating(5); setReviewImages([]); }} className="text-xs text-zinc-400 hover:text-zinc-600">
                        {t("productDetails.cancelEdit")}
                      </button>
                    )}
                  </div>
                  {reviewImages.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {reviewImages.map((img, i) => (
                        <div key={i} className="relative">
                          <img src={img} alt="" className="h-14 w-14 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700" />
                          <button type="button" onClick={() => setReviewImages((prev) => prev.filter((_, j) => j !== i))} className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-white">
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={submittingReview || !reviewComment.trim()}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50"
                  >
                    {submittingReview ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {submittingReview ? t("productDetails.submitting") : editingReview ? t("productDetails.updateReview") : t("productDetails.submitReview")}
                  </button>
                </form>
              </div>
            ) : (
              <p className="mt-6 text-sm text-zinc-500">
                <Link to="/login" className="font-medium text-emerald-600 hover:underline">{t("productDetails.logIn")}</Link> {t("productDetails.toLeaveReview")}
              </p>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-zinc-100 dark:border-zinc-800">
            <div className="mx-auto max-w-7xl px-4 py-8">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">{t("productDetails.youMayAlsoLike")}</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {relatedProducts.map((item) => (
                  <Link
                    to={`/products/${item._id}`}
                    key={item._id}
                    className="group rounded-xl border border-zinc-100 bg-white p-3 transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="aspect-square rounded-lg bg-zinc-50 overflow-hidden dark:bg-zinc-800 mb-3">
                      <img src={item.image || item.images?.[0] || "/placeholder.jpg"} alt={item.name} className="h-full w-full object-cover mix-blend-multiply dark:mix-blend-normal transition duration-500 group-hover:scale-105" />
                    </div>
                    <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{item.name}</h3>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-1">{formatPrice(item.price)}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Sticky Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white/95 backdrop-blur-md p-3 lg:hidden dark:border-zinc-800 dark:bg-zinc-950/95">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div>
                <p className="text-lg font-black text-zinc-900 dark:text-white">{formatPrice(currentPrice)}</p>
                {discountPercent > 0 && <p className="text-xs text-zinc-400 line-through">{formatPrice(originalPrice)}</p>}
              </div>
              <span className={`text-[11px] font-semibold ${currentStock > 0 ? "text-emerald-600" : "text-red-600"}`}>
                {currentStock > 0 ? t("productDetails.mobileInStock") : t("productDetails.mobileOutOfStock")}
              </span>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={actionLoading || currentStock < 1}
              className="flex h-12 flex-1 max-w-[200px] items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50"
            >
              <ShoppingCart size={16} />
              {t("productDetails.addToCart")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductDetails;
