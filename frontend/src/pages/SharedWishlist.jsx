import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Heart, ShoppingCart, ArrowLeft } from "lucide-react";
import SEO from "../components/SEO";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function SharedWishlist() {
  const { userId } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(!!userId);
  const [error, setError] = useState(userId ? "" : "Invalid wishlist link");

  useEffect(() => {
    if (!userId) return;
    axios.get(`${API}/wishlist/shared/${userId}`)
      .then(({ data }) => {
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => setError("Could not load wishlist"))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-green-50 dark:from-zinc-950 dark:to-zinc-900">
        <div className="h-16 w-16 animate-spin rounded-full border-2 border-green-600/20 border-t-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f5ef] dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Heart size={48} className="mx-auto text-zinc-300 mb-4" />
          <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{error}</h2>
          <Link to="/" className="text-emerald-600 hover:underline text-sm">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Shared Wishlist" />
      <div className="min-h-screen bg-[#f8f5ef] dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-3">
            <Heart className="text-green-600" size={28} />
            <h1 className="font-serif text-3xl font-bold text-zinc-800 dark:text-white">Shared Wishlist</h1>
          </div>

          {items.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-zinc-500">This wishlist is empty.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((product) => (
                <div key={product._id} className="rounded-2xl bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                  <img src={product.image} alt={product.name} className="h-48 w-full object-cover" />
                  <div className="p-4">
                    <h3 className="font-semibold text-zinc-800 dark:text-white truncate">{product.name}</h3>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mt-1">₹{product.price}</p>
                    <Link to={`/products/${product._id}`} className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-green-700">
                      <ShoppingCart size={14} />
                      View Product
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link to="/" className="group inline-flex items-center gap-2 text-sm text-emerald-600 hover:gap-3">
              <ArrowLeft size={16} />
              Browse Herb-Era
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default SharedWishlist;
