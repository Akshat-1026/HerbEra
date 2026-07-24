import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useTranslation } from "react-i18next";

export default function SearchSuggestions({ query }) {
  const { t } = useTranslation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.trim() === "") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setLoading(true);

        // 🔥 Better: backend search endpoint (recommended)
        const res = await api.get(`/products`);

        const filtered = res.data
          .filter((p) =>
            p.name.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 5);

        setResults(filtered);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  if (!query) return null;

  return (
    <div className="absolute z-50 w-full bg-white dark:bg-gray-900 shadow-lg rounded-md overflow-hidden">

      {/* LOADING STATE */}
      {loading && (
        <div className="p-3 text-sm text-gray-500">
          {t("searchSuggestions.searching")}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && results.length === 0 && (
        <div className="p-3 text-sm text-gray-500">
          {t("searchSuggestions.noProducts")}
        </div>
      )}

      {/* RESULTS */}
      {results.map((product) => (
        <Link
          key={product._id || product.id}
          to={`/products/${product._id || product.id}`}
          className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-10 h-10 object-cover rounded"
          />

          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-800 dark:text-white">
              {product.name}
            </span>

            <span className="text-xs text-gray-500">
              ₹{product.price}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}