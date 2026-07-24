/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";

const CompareContext = createContext();

const MAX_COMPARE = 4;

export function CompareProvider({ children }) {
  const [compareList, setCompareList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("herbEraCompare") || "[]");
    } catch {
      return [];
    }
  });

  const saveList = (list) => {
    localStorage.setItem("herbEraCompare", JSON.stringify(list));
    setCompareList(list);
  };

  const addToCompare = (product) => {
    if (compareList.some((p) => p._id === product._id)) return { success: false, message: "Already in compare list" };
    if (compareList.length >= MAX_COMPARE) return { success: false, message: `Maximum ${MAX_COMPARE} products can be compared` };
    saveList([...compareList, product]);
    return { success: true, message: "Added to compare" };
  };

  const removeFromCompare = (productId) => {
    saveList(compareList.filter((p) => p._id !== productId));
  };

  const clearCompare = () => {
    saveList([]);
  };

  const isInCompare = (productId) => compareList.some((p) => p._id === productId);

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export const useCompare = () => useContext(CompareContext);
