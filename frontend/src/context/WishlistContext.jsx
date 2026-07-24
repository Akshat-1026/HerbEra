/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useCallback, useRef, useState } from "react";
import axios from "axios";
import useAuth from "../hook/AuthContextHook";

const WishlistContext = createContext();
const STORAGE_KEY = "herbEraWishlist";

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const prevUser = useRef(user);

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  });

  const saveLocal = (items) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  };

  const mergeLocalWithBackend = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/wishlist");
      const backendItems = Array.isArray(res.data) ? res.data : [];

      const localIds = wishlist
        .filter((i) => typeof i === "string")
        .map((i) => i);

      const backendIds = backendItems
        .filter((i) => typeof i === "object" && i._id)
        .map((i) => i._id);

      const mergedIds = [...new Set([...localIds, ...backendIds])];

      if (backendItems.length > 0 && mergedIds.length === backendIds.length) {
        setWishlist(backendItems);
        saveLocal(backendItems);
      } else {
        const newBackendIds = mergedIds.filter(
          (id) => !backendIds.includes(id)
        );
        for (const id of newBackendIds) {
          await api.post("/wishlist", { productId: id });
        }
        const fresh = await api.get("/wishlist");
        const data = Array.isArray(fresh.data) ? fresh.data : [];
        setWishlist(data);
        saveLocal(data);
      }
    } catch (err) {
      console.error("Wishlist sync error:", err.message);
    } finally {
      setLoading(false);
    }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user && !prevUser.current) {
      mergeLocalWithBackend();
    }
    prevUser.current = user;
  }, [user, mergeLocalWithBackend]);

  useEffect(() => {
    saveLocal(wishlist);
  }, [wishlist]);

  const addToWishlist = async (productId, productData) => {
    const exists = wishlist.some(
      (item) => (typeof item === "string" ? item : item._id) === productId
    );
    if (exists) return;

    const newItem = productData || productId;
    setWishlist((prev) => [...prev, newItem]);

    try {
      await api.post("/wishlist", { productId });
    } catch (err) {
      console.error("Add wishlist error:", err.message);
    }
  };

  const removeFromWishlist = async (productId) => {
    setWishlist((prev) =>
      prev.filter(
        (item) => (typeof item === "string" ? item : item._id) !== productId
      )
    );

    try {
      await api.delete(`/wishlist/${productId}`);
    } catch (err) {
      console.error("Remove wishlist error:", err.message);
    }
  };

  const isInWishlist = (productId) => {
    if (!Array.isArray(wishlist)) return false;
    return wishlist.some(
      (item) => (typeof item === "string" ? item : item._id) === productId
    );
  };

  const toggleWishlist = async (productId, productData) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId, productData);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        mergeLocalWithBackend,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }
  return context;
};
