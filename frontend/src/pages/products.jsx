import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, Target, Star } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ProductCard from "../components/ProductCard";
import QuickViewModal from "../components/QuickViewModal";
import SEO from "../components/SEO";
import { useCurrency } from "../context/CurrencyContext";

export default function Products() {
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlFilter = searchParams.get("filter");

  /* =========================================
                STATES
  ========================================= */

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [sortOption, setSortOption] =
    useState("latest");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(searchParams.get("goal") || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  /* =========================================
                FETCH PRODUCTS
  ========================================= */

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/products`
        );

        setProducts(data);

        setLoading(false);
      } catch (error) {
        console.log(error);

        toast.error(t("products.errorLoad"));

        setLoading(false);
      }
    };

    fetchProducts();

    axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/goals/active`).then(({ data }) => {
      setGoals(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const goalParam = searchParams.get("goal");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (goalParam) setSelectedGoal(goalParam);
  }, [searchParams]);

  /* =========================================
                CATEGORIES
  ========================================= */

  const categories = useMemo(() => {
    const allCategories = products.map(
      (product) =>
        product.category || "Ayurvedic Wellness"
    );

    return [
      "All",
      ...new Set(allCategories),
    ];
  }, [products]);

  /* =========================================
                FILTER PRODUCTS
  ========================================= */

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // SEARCH

    filtered = filtered.filter((product) =>
      product.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    // URL FILTER

    if (urlFilter === "bestseller") {
      filtered = filtered.filter((p) => p.isBestseller);
    }

    if (urlFilter === "new") {
      filtered = filtered.filter((p) => p.isNewArrival);
    }

    // GOAL

    if (selectedGoal) {
      const goalObj = goals.find((g) => g.slug === selectedGoal);
      if (goalObj) {
        filtered = filtered.filter(
          (product) =>
            product.goals &&
            product.goals.some(
              (g) => (g._id || g) === goalObj._id
            )
        );
      }
    }

    // CATEGORY

    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (product) =>
          product.category === selectedCategory
      );
    }

    // SORT

    if (sortOption === "low") {
      filtered.sort(
        (a, b) => a.price - b.price
      );
    }

    if (sortOption === "high") {
      filtered.sort(
        (a, b) => b.price - a.price
      );
    }

    if (sortOption === "name") {
      filtered.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return filtered;
  }, [
    products,
    search,
    selectedCategory,
    sortOption,
    urlFilter,
    selectedGoal,
    goals,
  ]);

  const goalSuggestions = useMemo(() => {
    if (!search.trim()) {
      return goals.filter((g) => g.isActive !== false).slice(0, 4);
    }
    const q = search.toLowerCase();
    return goals
      .filter((g) => g.name.toLowerCase().includes(q) || (g.description || "").toLowerCase().includes(q))
      .slice(0, 3);
  }, [goals, search]);

  const suggestions = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return products
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [products, search]);

  /* =========================================
                UI
  ========================================= */

  return (
    <>
    <SEO title={t("products.pageTitle")} description={t("products.pageDescription")} />
    <div className="relative min-h-screen text-[#1f3a2f] dark:text-white">
      {/* Full-page background */}
      <div className="fixed inset-0 z-0">
        <img src="/images/shop.webp" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#f8f5ef]/10 dark:bg-[#0d0d0d]/10" />
      </div>

      <div className="relative z-10 px-6 py-10 md:px-14 lg:px-24">
      {/* =========================================
                    HEADER
      ========================================= */}

      <div className="mb-8 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-3 text-sm uppercase tracking-[5px] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
        >
          {t("products.sectionLabel")}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-3xl sm:text-5xl md:text-6xl text-emerald-950 drop-shadow-[0_2px_4px_rgba(255,255,255,0.3)]"
        >
          {t("products.heading")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-stone-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
        >
          {t("products.description")}
        </motion.p>
      </div>

      {/* =========================================
                    SEARCH BAR
      ========================================= */}

      <div className="mb-6 flex justify-center">
        <div className="relative w-full max-w-2xl">
          <motion.div
            animate={{ scale: searchFocused ? 1.01 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative"
          >
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
              size={20}
            />
            <input
              type="text"
              placeholder={t("products.searchPlaceholder")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                setSearchFocused(true);
                if (search.trim()) setShowSuggestions(true);
              }}
              onBlur={() => {
                setSearchFocused(false);
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              className={`w-full rounded-full border bg-white py-4 pl-14 pr-12 text-base outline-none transition-all duration-300 dark:bg-[#161616] dark:text-white ${
                searchFocused
                  ? "border-[#2d5c49] shadow-lg shadow-[#2d5c49]/10 dark:shadow-[#2d5c49]/5"
                  : "border-zinc-200 shadow-md dark:border-zinc-800"
              }`}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setShowSuggestions(false);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              >
                <X size={18} />
              </button>
            )}
          </motion.div>

          {/* Suggestions Dropdown */}
          {showSuggestions && (goalSuggestions.length > 0 || (search.trim().length > 0 && suggestions.length > 0)) && (
            <motion.ul
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[400px] overflow-y-auto rounded-2xl border border-zinc-100 bg-white shadow-xl dark:border-zinc-800 dark:bg-[#1a1a1a]"
            >
              {/* Goals Section */}
              {goalSuggestions.length > 0 && (
                <>
                  <li className="flex items-center gap-2 px-4 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    <Target size={12} />
                    Shop by Goal
                  </li>
                  {goalSuggestions.map((g) => {
                    const q = search.toLowerCase();
                    const name = g.name;
                    const matchStart = name.toLowerCase().indexOf(q);
                    const before = name.slice(0, matchStart);
                    const match = name.slice(matchStart, matchStart + q.length);
                    const after = name.slice(matchStart + q.length);
                    return (
                      <li
                        key={g._id}
                        onMouseDown={() => {
                          navigate(`/products?goal=${g.slug}`);
                        }}
                        className="flex cursor-pointer items-center gap-3.5 px-4 py-3 transition-colors hover:bg-emerald-50 dark:hover:bg-zinc-800"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                          {g.image ? (
                            <img src={g.image} alt="" className="h-full w-full rounded-xl object-cover" />
                          ) : (
                            <Target size={18} className="text-emerald-600 dark:text-emerald-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-[#1f3a2f] dark:text-white">
                            {before}
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{match}</span>
                            {after}
                          </p>
                          {g.description && (
                            <p className="mt-0.5 truncate text-xs text-zinc-400 dark:text-zinc-500">{g.description}</p>
                          )}
                        </div>
                        <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                          Goal
                        </span>
                      </li>
                    );
                  })}
                </>
              )}

              {/* Divider */}
              {goalSuggestions.length > 0 && suggestions.length > 0 && (
                <li className="border-t border-zinc-100 dark:border-zinc-800" />
              )}

              {/* Products Section */}
              {suggestions.length > 0 && (
                <>
                  <li className="px-4 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Products
                  </li>
                  {suggestions.map((p) => {
                    const q = search.toLowerCase();
                    const name = p.name;
                    const matchStart = name.toLowerCase().indexOf(q);
                    const before = name.slice(0, matchStart);
                    const match = name.slice(matchStart, matchStart + q.length);
                    const after = name.slice(matchStart + q.length);
                    return (
                      <li
                        key={p._id}
                        onMouseDown={() => {
                          navigate(`/products/${p._id}`);
                        }}
                        className="flex cursor-pointer items-center gap-3.5 px-4 py-3 transition-colors hover:bg-stone-50 dark:hover:bg-zinc-800"
                      >
                        <img
                          src={p.images?.[0] || p.image}
                          alt=""
                          className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-zinc-100 dark:ring-zinc-700"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-[#1f3a2f] dark:text-white">
                            {before}
                            <span className="font-bold text-[#2d5c49] dark:text-emerald-400">{match}</span>
                            {after}
                          </p>
                          <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                            {p.category || "Herbal"}
                            {p.price != null && (
                              <span className="ml-2 font-medium text-zinc-600 dark:text-zinc-300">{formatPrice(p.price)}</span>
                            )}
                            {p.rating > 0 && (
                              <span className="ml-2 inline-flex items-center gap-0.5 font-medium text-amber-500">
                                <Star size={10} fill="currentColor" />{p.rating.toFixed(1)}
                              </span>
                            )}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </>
              )}
            </motion.ul>
          )}
        </div>
      </div>

      {/* =========================================
                    FILTERS
      ========================================= */}

      <div className="mb-6 rounded-3xl bg-white p-4 shadow-lg dark:bg-[#161616]">
        {/* Row 1: Goal filters */}
        {goals.length > 0 && (
          <div className="mb-2">
            <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
              <div className="flex gap-2 min-w-max">
                <button
                  onClick={() => setSelectedGoal("")}
                  className={`whitespace-nowrap rounded-full px-5 py-1.5 text-xs font-medium transition-all ${
                    !selectedGoal
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
                  }`}
                >
                  All Goals
                </button>
                {goals.filter((g) => g.isActive !== false).map((goal) => (
                  <button
                    key={goal._id}
                    onClick={() => setSelectedGoal(goal.slug === selectedGoal ? "" : goal.slug)}
                    className={`whitespace-nowrap rounded-full px-5 py-1.5 text-xs font-medium transition-all ${
                      selectedGoal === goal.slug
                        ? "bg-emerald-600 text-white shadow-md"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
                    }`}
                  >
                    {goal.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Row 2: Category filters + Sort */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
            <div className="flex gap-2 min-w-max">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap rounded-full px-5 py-1.5 text-xs font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-[#1b3b2f] text-white shadow-md"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  }`}
                >
                  {category === "All" ? t("products.allProducts") : category}
                </button>
              ))}
            </div>
          </div>
          <div className="relative shrink-0">
            <SlidersHorizontal
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
              size={16}
            />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="appearance-none rounded-full border border-zinc-200 bg-white py-1.5 pl-9 pr-4 text-xs font-medium outline-none transition dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            >
              <option value="latest">{t("products.sortLatest")}</option>
              <option value="low">{t("products.sortLowHigh")}</option>
              <option value="high">{t("products.sortHighLow")}</option>
              <option value="name">{t("products.sortName")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* =========================================
                    LOADING
      ========================================= */}

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        /* =========================================
                    NO PRODUCTS
        ========================================= */

        <div className="py-32 text-center">
          <h2 className="text-4xl font-bold">
            {t("products.emptyHeading")}
          </h2>

          <p className="mt-4 text-zinc-500 dark:text-zinc-400">
            {t("products.emptyMessage")}
          </p>
        </div>
      ) : (
        /* =========================================
                    PRODUCT GRID
        ========================================= */

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map(
            (product, index) => (
              <ProductCard
                key={product._id}
                product={product}
                index={index}
                showQuickView
                onQuickView={(p) => setSelectedProduct(p)}
              />
            )
          )}
        </div>
      )}

      <QuickViewModal
        key={selectedProduct?._id || "closed"}
        product={selectedProduct}
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
      />

      </div>
    </div>
    </>
  );
}
