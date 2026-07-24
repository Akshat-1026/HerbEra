const STORAGE_KEY = "herbEraRecentlyViewed";
const MAX_ITEMS = 10;

export function useRecentlyViewed() {
  const getRecentlyViewed = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  };

  const addRecentlyViewed = (productId) => {
    if (!productId) return;
    try {
      const existing = getRecentlyViewed();
      const updated = [productId, ...existing.filter((id) => id !== productId)].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {} // eslint-disable-line no-empty
  };

  return { addRecentlyViewed, getRecentlyViewed };
}
