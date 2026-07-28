/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // ==========================
  // PLACE ORDER
  // ==========================
  const placeOrder = async (orderData) => {
    try {
      setLoading(true);

      const { data } = await axios.post(
        `${API}/orders`,
        orderData,
        { withCredentials: true }
      );

      setOrders((prev) => [...prev, data.order || data]);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Place Order Error:", error);

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to place order.",
      };
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // GET MY ORDERS
  // ==========================
  const getMyOrders = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(
        `${API}/orders/myorders`,
        { withCredentials: true }
      );

      setOrders(data);
    } catch (error) {
      console.error("Fetch Orders Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        placeOrder,
        getMyOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);

  if (!context) {
    throw new Error(
      "useOrder must be used within an OrderProvider"
    );
  }

  return context;
};