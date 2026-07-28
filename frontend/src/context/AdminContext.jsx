/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API = axios.create({ baseURL: API_BASE, withCredentials: true });

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("userInfo");
      window.location.href = "/admin";
    }
    return Promise.reject(err);
  }
);

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [banners, setBanners] = useState([]);
  const [combos, setCombos] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [deals, setDeals] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading] = useState(false);

  const fetchStats = useCallback(async () => {
    const { data } = await API.get("/admin/dashboard");
    setStats(data);
    return data;
  }, []);

  const fetchProducts = useCallback(async () => {
    const { data } = await API.get("/products");
    setProducts(data);
    return data;
  }, []);

  const createProduct = useCallback(async (product) => {
    const { data } = await API.post("/products", product);
    setProducts((prev) => [data, ...prev]);
    return data;
  }, []);

  const updateProduct = useCallback(async (id, product) => {
    const { data } = await API.put(`/products/${id}`, product);
    setProducts((prev) => prev.map((p) => (p._id === id ? data : p)));
    return data;
  }, []);

  const deleteProduct = useCallback(async (id) => {
    await API.delete(`/products/${id}`);
    setProducts((prev) => prev.filter((p) => p._id !== id));
  }, []);

  const fetchOrders = useCallback(async () => {
    const { data } = await API.get("/orders/admin");
    setOrders(data);
    return data;
  }, []);

  const updateOrderStatus = useCallback(async (id, status, note) => {
    const { data } = await API.put(`/orders/${id}/status`, { status, note });
    setOrders((prev) => prev.map((o) => (o._id === id ? data : o)));
    return data;
  }, []);

  const markOrderDelivered = useCallback(async (id) => {
    const { data } = await API.put(`/orders/${id}/deliver`);
    setOrders((prev) => prev.map((o) => (o._id === id ? data : o)));
    return data;
  }, []);

  const markAsPaid = useCallback(async (id, paymentMethod, note) => {
    const { data } = await API.put(`/orders/${id}/mark-paid`, { paymentMethod, note });
    setOrders((prev) => prev.map((o) => (o._id === id ? data : o)));
    return data;
  }, []);

  const deleteOrder = useCallback(async (id) => {
    await API.delete(`/orders/${id}`);
    setOrders((prev) => prev.filter((o) => o._id !== id));
  }, []);

  const refundOrder = useCallback(async (orderId, amount, reason) => {
    const { data } = await API.post(`/payment/refund/${orderId}`, { amount, reason });
    if (data.order) {
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)));
    }
    return data;
  }, []);

  const fetchUsers = useCallback(async () => {
    const { data } = await API.get("/auth/users");
    setUsers(data);
    return data;
  }, []);

  const deleteUser = useCallback(async (id) => {
    await API.delete(`/auth/users/${id}`);
    setUsers((prev) => prev.filter((u) => u._id !== id));
  }, []);

  const makeAdmin = useCallback(async (id) => {
    const { data } = await API.put(`/auth/users/${id}/make-admin`);
    setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, isAdmin: true } : u)));
    return data;
  }, []);

  const fetchCoupons = useCallback(async () => {
    const { data } = await API.get("/coupons");
    setCoupons(data);
    return data;
  }, []);

  const createCoupon = useCallback(async (coupon) => {
    const { data } = await API.post("/coupons", coupon);
    setCoupons((prev) => [data, ...prev]);
    return data;
  }, []);

  const deleteCoupon = useCallback(async (id) => {
    await API.delete(`/coupons/${id}`);
    setCoupons((prev) => prev.filter((c) => c._id !== id));
  }, []);

  const fetchReviews = useCallback(async () => {
    const { data } = await API.get("/reviews");
    setReviews(data);
    return data;
  }, []);

  const deleteReview = useCallback(async (id) => {
    await API.delete(`/reviews/${id}`);
    setReviews((prev) => prev.filter((r) => r._id !== id));
  }, []);

  const fetchBanners = useCallback(async () => {
    const { data } = await API.get("/banners");
    setBanners(data);
    return data;
  }, []);

  const createBanner = useCallback(async (banner) => {
    const { data } = await API.post("/banners", banner);
    setBanners((prev) => [data, ...prev]);
    return data;
  }, []);

  const updateBanner = useCallback(async (id, banner) => {
    const { data } = await API.put(`/banners/${id}`, banner);
    setBanners((prev) => prev.map((b) => (b._id === id ? data : b)));
    return data;
  }, []);

  const deleteBanner = useCallback(async (id) => {
    await API.delete(`/banners/${id}`);
    setBanners((prev) => prev.filter((b) => b._id !== id));
  }, []);

  const fetchCombos = useCallback(async () => {
    const { data } = await API.get("/combos/all");
    setCombos(data);
    return data;
  }, []);

  const createCombo = useCallback(async (combo) => {
    const { data } = await API.post("/combos", combo);
    setCombos((prev) => [data, ...prev]);
    return data;
  }, []);

  const updateCombo = useCallback(async (id, combo) => {
    const { data } = await API.put(`/combos/${id}`, combo);
    setCombos((prev) => prev.map((c) => (c._id === id ? data : c)));
    return data;
  }, []);

  const deleteCombo = useCallback(async (id) => {
    await API.delete(`/combos/${id}`);
    setCombos((prev) => prev.filter((c) => c._id !== id));
  }, []);

  const fetchAdminBlogs = useCallback(async () => {
    const { data } = await API.get("/blogs/admin/all?limit=10000");
    setBlogs(data.blogs || data);
    return data;
  }, []);

  const createBlog = useCallback(async (blog) => {
    const { data } = await API.post("/blogs", blog);
    setBlogs((prev) => [data, ...prev]);
    return data;
  }, []);

  const updateBlog = useCallback(async (id, blog) => {
    const { data } = await API.put(`/blogs/${id}`, blog);
    setBlogs((prev) => prev.map((b) => (b._id === id ? data : b)));
    return data;
  }, []);

  const deleteBlog = useCallback(async (id) => {
    await API.delete(`/blogs/${id}`);
    setBlogs((prev) => prev.filter((b) => b._id !== id));
  }, []);

  const fetchAdminDeals = useCallback(async () => {
    const { data } = await API.get("/deals/all");
    setDeals(data);
    return data;
  }, []);

  const createDeal = useCallback(async (deal) => {
    const { data } = await API.post("/deals", deal);
    setDeals((prev) => [data, ...prev]);
    return data;
  }, []);

  const updateDeal = useCallback(async (id, deal) => {
    const { data } = await API.put(`/deals/${id}`, deal);
    setDeals((prev) => prev.map((d) => (d._id === id ? data : d)));
    return data;
  }, []);

  const deleteDeal = useCallback(async (id) => {
    await API.delete(`/deals/${id}`);
    setDeals((prev) => prev.filter((d) => d._id !== id));
  }, []);

  const fetchAdminGoals = useCallback(async () => {
    const { data } = await API.get("/goals");
    setGoals(data);
    return data;
  }, []);

  const createGoal = useCallback(async (goal) => {
    const { data } = await API.post("/goals", goal);
    setGoals((prev) => [data, ...prev]);
    return data;
  }, []);

  const updateGoal = useCallback(async (id, goal) => {
    const { data } = await API.put(`/goals/${id}`, goal);
    setGoals((prev) => prev.map((g) => (g._id === id ? data : g)));
    return data;
  }, []);

  const deleteGoal = useCallback(async (id) => {
    await API.delete(`/goals/${id}`);
    setGoals((prev) => prev.filter((g) => g._id !== id));
  }, []);

  const value = {
    stats, products, orders, users, coupons, reviews, banners, combos, goals, loading,
    fetchStats, fetchProducts, createProduct, updateProduct, deleteProduct,
    fetchOrders, updateOrderStatus, markOrderDelivered, markAsPaid, deleteOrder, refundOrder,
    fetchUsers, deleteUser, makeAdmin,
    fetchCoupons, createCoupon, deleteCoupon,
    fetchReviews, deleteReview,
    fetchBanners, createBanner, updateBanner, deleteBanner,
    fetchCombos, createCombo, updateCombo, deleteCombo,
    blogs, fetchAdminBlogs, createBlog, updateBlog, deleteBlog,
    deals, fetchAdminDeals, createDeal, updateDeal, deleteDeal,
    fetchAdminGoals, createGoal, updateGoal, deleteGoal,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export default AdminContext;
