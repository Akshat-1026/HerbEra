import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useCompare } from "../context/CompareContext";
import { ArrowLeft, X, Scale, ShoppingCart, Star, Zap } from "lucide-react";
import { useCart } from "../hook/CartHook";
import { toast } from "react-toastify";
import SEO from "../components/SEO";

function getDiscountPercent(product, selectedVariant) {
  if (selectedVariant?.originalPrice > 0) {
    return Math.round((1 - selectedVariant.price / selectedVariant.originalPrice) * 100);
  }
  if (!selectedVariant && product.originalPrice > 0) {
    return Math.round((1 - product.price / product.originalPrice) * 100);
  }
  return 0;
}

function Compare() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();

  const fields = [
    {
      key: "price",
      render: (product) => {
        const hasVariants = product.variants?.length > 0;
        if (hasVariants) {
          const min = Math.min(...product.variants.map((v) => v.price));
          const max = Math.max(...product.variants.map((v) => v.price));
          return (
            <span className="text-base font-bold text-zinc-900 dark:text-white">
              ₹{min} – ₹{max}
            </span>
          );
        }
        const dp = getDiscountPercent(product, null);
        return (
          <div className="flex flex-col items-center gap-1">
            <span className="text-base font-bold text-zinc-900 dark:text-white">₹{product.price}</span>
            {product.originalPrice > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-zinc-400 line-through">₹{product.originalPrice}</span>
                {dp > 0 && (
                  <span className="rounded-sm bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{dp}% OFF</span>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "rating",
      render: (product) => (
        <div className="flex items-center justify-center gap-1.5">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={13}
                className={
                  s <= Math.round(product.rating || 0)
                    ? "fill-amber-400 text-amber-400"
                    : "text-zinc-300 dark:text-zinc-600"
                }
              />
            ))}
          </div>
          {product.numReviews > 0 && (
            <span className="text-xs text-zinc-500">({product.numReviews})</span>
          )}
        </div>
      ),
    },
    {
      key: "sku",
      render: (product) => (
        <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">{product.sku || t("compare.na")}</span>
      ),
    },
    {
      key: "category",
      render: (product) => (
        <span className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          {product.category || t("compare.na")}
        </span>
      ),
    },
    {
      key: "availability",
      render: (product) => {
        const hasVariants = product.variants?.length > 0;
        const inStock = hasVariants
          ? product.variants.some((v) => v.countInStock > 0)
          : product.countInStock > 0;
        return (
          <span className={`text-xs font-semibold ${inStock ? "text-emerald-600" : "text-red-500"}`}>
            {inStock ? t("compare.inStock") : t("compare.outOfStock")}
          </span>
        );
      },
    },
    {
      key: "herbalType",
      render: (product) => {
        const typeMap = {
          single: t("compare.single"),
          compound: t("compare.compound"),
          formulation: t("compare.formulation"),
        };
        return (
          <span className="text-xs text-zinc-600 dark:text-zinc-400">
            {typeMap[product.herbalType] || product.herbalType || t("compare.na")}
          </span>
        );
      },
    },
    {
      key: "description",
      render: (product) => (
        <p className="mx-auto max-w-[280px] text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-4">
          {product.description || t("compare.na")}
        </p>
      ),
    },
    {
      key: "benefits",
      render: (product) => {
        const items = product.benefits || [];
        return items.length > 0 ? (
          <ul className="mx-auto max-w-[280px] list-disc space-y-1 text-left">
            {items.slice(0, 5).map((b, i) => (
              <li key={i} className="text-xs text-zinc-600 dark:text-zinc-400">
                {b}
              </li>
            ))}
            {items.length > 5 && (
              <li className="text-xs text-zinc-400">{t("compare.more", { count: items.length - 5 })}</li>
            )}
          </ul>
        ) : (
          <span className="text-xs text-zinc-400">{t("compare.na")}</span>
        );
      },
    },
    {
      key: "ingredients",
      render: (product) => {
        const items = product.ingredients || [];
        return items.length > 0 ? (
          <ul className="mx-auto max-w-[280px] list-disc space-y-1 text-left">
            {items.slice(0, 4).map((ing, i) => (
              <li key={i} className="text-xs text-zinc-600 dark:text-zinc-400">
                {ing}
              </li>
            ))}
            {items.length > 4 && (
              <li className="text-xs text-zinc-400">{t("compare.more", { count: items.length - 4 })}</li>
            )}
          </ul>
        ) : (
          <span className="text-xs text-zinc-400">{t("compare.na")}</span>
        );
      },
    },
    {
      key: "certifications",
      render: (product) => {
        const items = product.certifications || [];
        return items.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-1">
            {items.map((c, i) => (
              <span
                key={i}
                className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              >
                {c}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-zinc-400">{t("compare.na")}</span>
        );
      },
    },
    {
      key: "usageInstructions",
      render: (product) => (
        <p className="mx-auto max-w-[280px] text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-3">
          {product.usageInstructions || t("compare.na")}
        </p>
      ),
    },
    {
      key: "sideEffects",
      render: (product) => (
        <p className="mx-auto max-w-[280px] text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-3">
          {product.sideEffects || t("compare.na")}
        </p>
      ),
    },
  ];

  return (
    <>
      <SEO title={t("compare.pageTitle")} />
      <div className="min-h-screen bg-[#f8f5ef] dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/40">
                <Scale className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="font-serif text-3xl font-bold text-zinc-800 dark:text-white">{t("compare.heading")}</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {t("compare.subtitle", { count: compareList.length })}
                </p>
              </div>
            </div>
            {compareList.length > 0 && (
              <button
                onClick={clearCompare}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                {t("compare.clearAll")}
              </button>
            )}
          </div>

          {compareList.length === 0 ? (
            <div className="py-24 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <Scale className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-zinc-800 dark:text-white">{t("compare.emptyHeading")}</h2>
              <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t("compare.emptyDesc")}</p>
              <Link
                to="/products"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                <ArrowLeft size={18} />
                {t("compare.browseProducts")}
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 w-36 bg-white p-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                      {t("compare.feature")}
                    </th>
                    {compareList.map((product) => (
                      <th key={product._id} className="p-4 text-center">
                        <div className="relative">
                          <button
                            onClick={() => {
                              removeFromCompare(product._id);
                              toast(t("compare.removedFromCompare"));
                            }}
                            className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-500 shadow-sm transition hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400"
                          >
                            <X size={12} />
                          </button>
                          <Link to={`/products/${product._id}`}>
                            <img
                              src={product.image}
                              alt={product.name}
                              className="mx-auto mb-3 h-36 w-36 rounded-xl object-cover shadow-sm"
                            />
                          </Link>
                          <Link
                            to={`/products/${product._id}`}
                            className="block text-sm font-semibold text-zinc-800 transition hover:text-emerald-700 dark:text-white dark:hover:text-emerald-400"
                          >
                            {product.name}
                          </Link>
                          {product.isBestseller && (
                            <span className="mt-1 inline-block rounded-sm bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                              {t("productCard.bestSeller")}
                            </span>
                          )}
                          {product.isNewArrival && !product.isBestseller && (
                            <span className="mt-1 inline-block rounded-sm bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                              {t("productCard.new")}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, fi) => (
                    <tr
                      key={field.key}
                      className={`border-t border-zinc-100 dark:border-zinc-800 ${
                        fi % 2 === 0 ? "bg-zinc-50/50 dark:bg-zinc-800/20" : ""
                      }`}
                    >
                      <td className="sticky left-0 z-10 bg-white p-4 text-sm font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                        {t(`compare.${field.key}`)}
                      </td>
                      {compareList.map((product) => (
                        <td key={product._id} className="p-4 text-center align-top">
                          {field.render(product)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-zinc-200 dark:border-zinc-700">
                    <td className="sticky left-0 z-10 bg-white p-4 dark:bg-zinc-900" />
                    {compareList.map((product) => (
                      <td key={product._id} className="p-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <button
                            onClick={() => {
                              addToCart(product);
                              toast.success(`${product.name} ${t("productCard.addedToCart")}`);
                            }}
                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                          >
                            <ShoppingCart size={14} />
                            {t("compare.addToCart")}
                          </button>
                          <button
                            onClick={() => {
                              addToCart(product);
                              navigate("/checkout");
                            }}
                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-600 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                          >
                            <Zap size={14} />
                            {t("compare.buyNow")}
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Compare;