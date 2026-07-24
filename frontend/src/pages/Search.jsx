import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { motion } from "framer-motion";
import { Search, X, ChevronDown, Star, ArrowUpDown, Filter, Grid3X3 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import ProductCard from "../components/ProductCard";
import SEO from "../components/SEO";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

const ratings = [4, 3, 2, 1];

const SkeletonCard = () => (
  <div className="animate-pulse rounded-[30px] bg-white dark:bg-[#161616] overflow-hidden">
    <div className="aspect-[4/3] bg-zinc-200 dark:bg-zinc-800" />
    <div className="p-6 space-y-3">
      <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
      <div className="h-5 w-40 bg-zinc-200 dark:bg-zinc-800 rounded" />
      <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
    </div>
  </div>
);

function FilterSidebar({ t, categories, herbalTypes, category, onCategoryChange, minPrice, onMinPriceChange, maxPrice, onMaxPriceChange, rating, onRatingChange, inStock, onInStockChange, bestseller, onBestsellerChange, newArrival, onNewArrivalChange, herbalType, onHerbalTypeChange, activeFilters, onClearFilters, renderStars, onPageReset }) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 font-serif text-lg font-semibold">{t("search.filterCategories")}</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { onCategoryChange(cat); onPageReset(); }}
              className={`block w-full rounded-xl px-4 py-2 text-left transition text-sm ${
                category === cat
                  ? "bg-[#1b3b2f] text-white"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-serif text-lg font-semibold">{t("search.filterPriceRange")}</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={t("search.min")}
            value={minPrice}
            onChange={(e) => { onMinPriceChange(e.target.value); onPageReset(); }}
            className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-green-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
          <span className="text-zinc-400">—</span>
          <input
            type="number"
            placeholder={t("search.max")}
            value={maxPrice}
            onChange={(e) => { onMaxPriceChange(e.target.value); onPageReset(); }}
            className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-green-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-serif text-lg font-semibold">{t("search.filterRating")}</h3>
        <div className="space-y-2">
          {ratings.map((r) => (
            <button
              key={r}
              onClick={() => { onRatingChange(r.toString()); onPageReset(); }}
              className={`flex w-full items-center gap-2 rounded-xl px-4 py-2 transition ${
                rating === r.toString()
                  ? "bg-[#1b3b2f] text-white"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {renderStars(r)}
              <span className="text-sm">{t("search.ratingUp")}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-serif text-lg font-semibold">{t("search.filterAvailability")}</h3>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={inStock}
            onChange={() => { onInStockChange(!inStock); onPageReset(); }}
            className="h-4 w-4 accent-green-600"
          />
          <span className="text-sm">{t("search.inStockOnly")}</span>
        </label>
      </div>

      <div>
        <h3 className="mb-4 font-serif text-lg font-semibold">{t("search.filterFeatured")}</h3>
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={bestseller}
              onChange={() => { onBestsellerChange(!bestseller); onPageReset(); }}
              className="h-4 w-4 accent-green-600"
            />
            <span className="text-sm">{t("search.bestseller")}</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={newArrival}
              onChange={() => { onNewArrivalChange(!newArrival); onPageReset(); }}
              className="h-4 w-4 accent-green-600"
            />
            <span className="text-sm">{t("search.newArrival")}</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-serif text-lg font-semibold">{t("search.filterHerbalType")}</h3>
        <div className="space-y-2">
          {herbalTypes.map((type) => (
            <button
              key={type}
              onClick={() => { onHerbalTypeChange(type); onPageReset(); }}
              className={`block w-full rounded-xl px-4 py-2 text-left transition text-sm ${
                herbalType === type
                  ? "bg-[#1b3b2f] text-white"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {activeFilters.length > 0 && (
        <button
          onClick={onClearFilters}
          className="w-full rounded-xl bg-red-50 py-3 text-sm font-medium text-red-600 transition hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
        >
          {t("search.clearAllFilters")}
        </button>
      )}
    </div>
  );
}

export default function SearchPage() {
  const { t } = useTranslation();

  const categories = [
    t("search.categoryAll"),
    t("search.categoryHerbalSupplement"),
    t("search.categoryAyurvedicPowder"),
    t("search.categoryEnergyBooster"),
    t("search.categoryDigestiveHealth"),
    t("search.categoryEnergyVitality"),
    t("search.categorySkinCare"),
    t("search.categoryHairCare"),
    t("search.categoryImmuneSupport"),
  ];

  const herbalTypes = [t("search.typeAll"), t("search.typeSingle"), t("search.typeCompound"), t("search.typeFormulation")];

  const sortOptions = [
    { value: "default", label: t("search.sortDefault") },
    { value: "price_asc", label: t("search.sortLowHigh") },
    { value: "price_desc", label: t("search.sortHighLow") },
    { value: "rating", label: t("search.sortRating") },
    { value: "newest", label: t("search.sortNewest") },
    { value: "name_asc", label: t("search.sortNameAZ") },
  ];

  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [rating, setRating] = useState(searchParams.get("rating") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "default");
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [inStock, setInStock] = useState(searchParams.get("inStock") === "true");
  const [bestseller, setBestseller] = useState(searchParams.get("bestseller") === "true");
  const [newArrival, setNewArrival] = useState(searchParams.get("newArrival") === "true");
  const [herbalType, setHerbalType] = useState(searchParams.get("herbalType") || "All");

  const buildParams = useCallback(() => {
    const params = {};
    if (q) params.q = q;
    if (category && category !== "All") params.category = category;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (rating) params.rating = rating;
    if (sort && sort !== "default") params.sort = sort;
    if (page > 1) params.page = page;
    if (inStock) params.inStock = "true";
    if (bestseller) params.bestseller = "true";
    if (newArrival) params.newArrival = "true";
    if (herbalType && herbalType !== "All") params.herbalType = herbalType;
    return params;
  }, [q, category, minPrice, maxPrice, rating, sort, page, inStock, bestseller, newArrival, herbalType]);

  useEffect(() => {
    const params = buildParams();
    setSearchParams(params, { replace: true });
  }, [buildParams, setSearchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = buildParams();
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/products/search`, { params });
        if (data.products) {
          setProducts(data.products);
          setTotalCount(data.totalCount || data.products.length);
          setTotalPages(data.totalPages || 1);
        } else {
          setProducts(data);
          setTotalCount(data.length);
          setTotalPages(1);
        }
      } catch {
        toast.error(t("search.errorLoad"));
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [q, category, minPrice, maxPrice, rating, sort, page, inStock, bestseller, newArrival, herbalType, buildParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setQ("");
    setCategory("All");
    setMinPrice("");
    setMaxPrice("");
    setRating("");
    setSort("default");
    setPage(1);
    setInStock(false);
    setBestseller(false);
    setNewArrival(false);
    setHerbalType("All");
  };

  const removeFilter = (key) => {
    switch (key) {
      case "q": setQ(""); break;
      case "category": setCategory("All"); break;
      case "minPrice": setMinPrice(""); break;
      case "maxPrice": setMaxPrice(""); break;
      case "rating": setRating(""); break;
      case "sort": setSort("default"); break;
      case "inStock": setInStock(false); break;
      case "bestseller": setBestseller(false); break;
      case "newArrival": setNewArrival(false); break;
      case "herbalType": setHerbalType("All"); break;
    }
    setPage(1);
  };

  const activeFilters = [];
  if (q) activeFilters.push({ key: "q", label: `"${q}"` });
  if (category && category !== "All") activeFilters.push({ key: "category", label: category });
  if (minPrice) activeFilters.push({ key: "minPrice", label: `Min ₹${minPrice}` });
  if (maxPrice) activeFilters.push({ key: "maxPrice", label: `Max ₹${maxPrice}` });
  if (rating) activeFilters.push({ key: "rating", label: `${rating}+ Stars` });
  if (sort && sort !== "default") {
    const opt = sortOptions.find((o) => o.value === sort);
    if (opt) activeFilters.push({ key: "sort", label: opt.label });
  }
  if (inStock) activeFilters.push({ key: "inStock", label: t("search.inStockOnly") });
  if (bestseller) activeFilters.push({ key: "bestseller", label: t("search.bestseller") });
  if (newArrival) activeFilters.push({ key: "newArrival", label: t("search.newArrival") });
  if (herbalType && herbalType !== "All") activeFilters.push({ key: "herbalType", label: herbalType });

  const renderStars = (count) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= count ? "fill-yellow-400 text-yellow-400" : "text-zinc-300 dark:text-zinc-600"}
        />
      ))}
    </div>
  );

  return (

    <>
    <SEO title={t("search.pageTitle")} />
    <div className="min-h-screen bg-[#f8f5ef] text-[#1f3a2f] dark:bg-[#0d0d0d] dark:text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-14 lg:px-8">
        <motion.div {...fadeUp(0)} className="mb-10 text-center">
          <p className="mb-3 text-sm uppercase tracking-[5px] text-[#557c6c]">
            {t("search.sectionLabel")}
          </p>
          <h1 className="font-serif text-5xl md:text-6xl">{t("search.heading")}</h1>
        </motion.div>

        <form onSubmit={handleSearch} className="relative mx-auto mb-8 max-w-2xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={22} />
          <input
            type="text"
            placeholder={t("search.searchPlaceholder")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 bg-white py-4 pl-14 pr-14 text-lg outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
          {q && (
            <button
              type="button"
              onClick={() => { setQ(""); setPage(1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 hover:text-zinc-600"
            >
              <X size={20} />
            </button>
          )}
        </form>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 lg:hidden"
            >
              <Filter size={16} />
              {t("search.filters")}
              <ChevronDown size={14} className={`transition ${showFilters ? "rotate-180" : ""}`} />
            </button>

            <div className="hidden items-center gap-2 lg:flex">
              <Grid3X3 size={16} className="text-zinc-400" />
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {loading ? t("search.searching") : t("search.found", { count: totalCount })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <ArrowUpDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-8 text-sm outline-none transition focus:border-green-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <span
              key={filter.key}
              className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm shadow-sm dark:bg-zinc-800"
            >
              {filter.label}
              <button onClick={() => removeFilter(filter.key)} className="text-zinc-400 hover:text-red-500">
                <X size={14} />
              </button>
            </span>
          ))}
          {activeFilters.length > 1 && (
            <button
              onClick={clearFilters}
              className="text-sm text-[#557c6c] underline underline-offset-2 hover:text-green-700"
            >
              {t("search.clearAll")}
            </button>
          )}
        </div>

        <div className="flex gap-10">
          <motion.aside
            initial={false}
            className={`${
              showFilters ? "block" : "hidden"
            } w-full shrink-0 lg:block lg:w-72`}
          >
            <div className="sticky top-24 rounded-3xl bg-white p-6 shadow-md dark:bg-[#161616]">
              <FilterSidebar
                t={t}
                categories={categories}
                herbalTypes={herbalTypes}
                category={category}
                onCategoryChange={setCategory}
                minPrice={minPrice}
                onMinPriceChange={setMinPrice}
                maxPrice={maxPrice}
                onMaxPriceChange={setMaxPrice}
                rating={rating}
                onRatingChange={setRating}
                inStock={inStock}
                onInStockChange={setInStock}
                bestseller={bestseller}
                onBestsellerChange={setBestseller}
                newArrival={newArrival}
                onNewArrivalChange={setNewArrival}
                herbalType={herbalType}
                onHerbalTypeChange={setHerbalType}
                activeFilters={activeFilters}
                onClearFilters={clearFilters}
                renderStars={renderStars}
                onPageReset={() => setPage(1)}
              />
            </div>
          </motion.aside>

          <div className="flex-1">
            {loading ? (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <SkeletonCard key={n} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Search size={48} className="mb-4 text-zinc-300 dark:text-zinc-600" />
                <h2 className="text-2xl font-serif font-semibold">{t("search.noProductsFound")}</h2>
                <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                  {t("search.noProductsDesc")}
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-6 rounded-xl bg-[#1b3b2f] px-6 py-3 text-white transition hover:bg-[#264d3d]"
                >
                  {t("search.clearFilters")}
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center gap-2 lg:hidden">
                  <Grid3X3 size={16} className="text-zinc-400" />
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {t("search.found", { count: totalCount })}
                  </span>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product, index) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      index={index}
                      showDescription
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-14 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page <= 1}
                      className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                    >
                      {t("search.previous")}
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`rounded-xl px-4 py-2 text-sm transition ${
                          page === p
                            ? "bg-[#1b3b2f] text-white"
                            : "border border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page >= totalPages}
                      className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                    >
                      {t("search.next")}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
