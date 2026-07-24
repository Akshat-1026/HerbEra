import { useWishlist } from "../context/WishlistContext";

export const useWishlistHook = () => {
  const context = useWishlist();

  if (context === undefined) {
    throw new Error("useWishlistHook must be used within a WishlistProvider");
  }

  return context;
};

export default useWishlistHook;