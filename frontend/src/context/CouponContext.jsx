import { createContext, useContext, useState } from "react";
import axios from "axios";

const CouponContext = createContext();

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = API_BASE;

export function CouponProvider({ children }) {
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [validating, setValidating] = useState(false);

  const applyCoupon = async (code) => {
    const formatted = code.trim().toUpperCase();

    if (!formatted) return "Please enter a coupon code";

    setValidating(true);
    try {
      const { data } = await axios.post(`${API_URL}/coupons/validate`, { code: formatted });

      if (!data.valid) {
        setDiscount(0);
        setCouponCode("");
        return data.message || "Invalid coupon code";
      }

      setDiscount(data.discount);
      setCouponCode(formatted);
      return `${data.discount}% Discount Applied!`;
    } catch {
      setDiscount(0);
      setCouponCode("");
      return "Failed to validate coupon. Please try again.";
    } finally {
      setValidating(false);
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setCouponCode("");
  };

  return (
    <CouponContext.Provider
      value={{
        discount,
        couponCode,
        applyCoupon,
        removeCoupon,
        validating,
      }}
    >
      {children}
    </CouponContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCoupon = () => useContext(CouponContext);
