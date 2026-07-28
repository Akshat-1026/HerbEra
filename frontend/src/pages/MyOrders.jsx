import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { Package, Clock, MapPin, ChevronDown, ChevronUp, ShoppingBag, Calendar, Truck, CheckCircle, XCircle, Eye } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../context/CurrencyContext";
import SEO from "../components/SEO";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

function MyOrders() {
  const { t } = useTranslation();
  const { userInfo } = useContext(AuthContext);
  const { formatPrice } = useCurrency();
  const statusFilters = ["All", "Processing", "Shipped", "Delivered", "Cancelled"];
  const statusConfig = {
    pending: { label: t("myOrders.pending"), color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300", icon: Clock },
    confirmed: { label: t("myOrders.confirmed"), color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300", icon: CheckCircle },
    processing: { label: t("myOrders.processing"), color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300", icon: Package },
    shipped: { label: t("myOrders.shipped"), color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300", icon: Truck },
    delivered: { label: t("myOrders.delivered"), color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", icon: CheckCircle },
    cancelled: { label: t("myOrders.cancelled"), color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300", icon: XCircle },
  };
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    setLoading(true); // eslint-disable-line react-hooks/set-state-in-effect
    axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/orders/myorders`, { withCredentials: true })
      .then(({ data }) => setOrders(data))
      .catch(() => toast.error(t("myOrders.errorLoad")))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredOrders = activeFilter === "All"
    ? orders
    : orders.filter((o) => {
        const s = o.status || (o.isDelivered ? "delivered" : "pending");
        return s.toLowerCase() === activeFilter.toLowerCase();
      });

  const handleCancel = async (orderId) => {
    if (!confirm(t("myOrders.cancelConfirm"))) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/orders/${orderId}/cancel`, { reason: "Cancelled by user" }, { withCredentials: true });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: "cancelled", timeline: [...(o.timeline || []), { status: "cancelled", date: new Date(), note: "Cancelled by user" }] } : o));
      toast.success(t("myOrders.orderCancelled"));
    } catch {
      toast.error(t("myOrders.errorCancel"));
    }
  };

  const getStatusInfo = (order) => {
    const s = order.status || (order.isDelivered ? "delivered" : "pending");
    return statusConfig[s] || statusConfig.pending;
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-[#F8F4EF] dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Package size={64} className="mx-auto text-zinc-300 mb-4" />
          <p className="text-zinc-500 mb-4">{t("myOrders.loginPrompt")}</p>
          <Link to="/login" className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700">{t("myOrders.login")}</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title={t("myOrders.pageTitle")} />
      <div className="min-h-screen bg-[#F8F4EF] dark:bg-zinc-950">
        <div className="relative bg-linear-to-br from-green-900 via-green-800 to-emerald-900 text-white px-4 py-12 md:py-16">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl md:text-4xl font-bold">{t("myOrders.heading")}</h1>
              <p className="text-emerald-200 mt-2 text-sm md:text-base">{t("myOrders.subtitle")}</p>
            </motion.div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-sm animate-pulse">
                  <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3 mb-4" />
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/4 mb-3" />
                  <div className="flex gap-3">
                    <div className="h-12 w-12 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
                    <div className="h-12 w-12 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
                    <div className="h-12 w-12 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <motion.div {...fadeUp()} className="rounded-3xl bg-white dark:bg-zinc-900 p-12 text-center shadow-md">
              <ShoppingBag size={64} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
              <h2 className="text-xl font-bold mb-2">{t("myOrders.noOrders")}</h2>
              <p className="text-zinc-500 dark:text-zinc-400 mb-6">{t("myOrders.noOrdersDesc")}</p>
              <Link to="/products" className="inline-block rounded-xl bg-green-600 px-8 py-3 font-semibold text-white hover:bg-green-700 transition-colors">{t("myOrders.startShopping")}</Link>
            </motion.div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-6">
                {statusFilters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeFilter === f
                        ? "bg-green-600 text-white"
                        : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-sm"
                    }`}
                  >
{t("myOrders." + f.toLowerCase())}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={activeFilter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  {filteredOrders.length === 0 ? (
                    <div className="rounded-2xl bg-white dark:bg-zinc-900 p-8 text-center shadow-sm">
                      <p className="text-zinc-500">{t("myOrders.noFilterResults", { filter: t("myOrders." + activeFilter.toLowerCase()) })}</p>
                    </div>
                  ) : (
                    filteredOrders.map((order) => {
                      const status = getStatusInfo(order);
                      const StatusIcon = status.icon;
                      const isExpanded = expanded === order._id;
                      return (
                        <motion.div
                          key={order._id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-2xl bg-white dark:bg-zinc-900 shadow-sm overflow-hidden"
                        >
                          <div className="p-5 md:p-6">
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${status.color.split(" ")[0]}`}>
                                  <StatusIcon size={20} className={status.color.split(" ")[1]} />
                                </div>
                                <div>
                                  <p className="font-semibold text-sm">{t("myOrders.orderPrefix")}{order._id?.slice(-8).toUpperCase()}</p>
                                  <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                    <Calendar size={12} />
                                    {new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                  {status.label}
                                </span>
                                <span className="font-bold text-lg">{formatPrice(order.totalPrice)}</span>
                              </div>
                            </div>

                            {order.trackingNumber && (
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-1">
                                <MapPin size={12} />
                                {t("myOrders.tracking")}: <span className="font-mono font-medium">{order.trackingNumber}</span>
                              </p>
                            )}

                            <div className="flex flex-wrap gap-2.5">
                              {order.orderItems?.slice(0, isExpanded ? undefined : 4).map((item, i) => (
                                <div key={i} className="flex items-center gap-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-2">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                    loading="lazy"
                                  />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium truncate max-w-[120px] md:max-w-[200px]">{item.name}</p>
                                    {item.variantLabel && <p className="text-[11px] text-zinc-400">{item.variantLabel}</p>}
                                    <p className="text-xs text-zinc-500">x{item.qty} — {formatPrice(item.price * item.qty)}</p>
                                  </div>
                                </div>
                              ))}
                              {!isExpanded && order.orderItems?.length > 4 && (
                                <button
                                  onClick={() => setExpanded(order._id)}
                                  className="flex items-center text-xs text-zinc-500 hover:text-green-600 font-medium"
                                >
                                  +{order.orderItems.length - 4} more
                                </button>
                              )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex gap-3">
                                <Link
                                  to={`/track-order?tracking=${order.trackingNumber || ""}`}
                                  className="flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                                >
                                  <Eye size={16} />
                                  {t("myOrders.track")}
                                </Link>
                                {(!order.status || !["delivered", "cancelled", "shipped"].includes(order.status)) && (
                                  <button
                                    onClick={() => handleCancel(order._id)}
                                    className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                                  >
                                    <XCircle size={16} />
                                    {t("myOrders.cancel")}
                                  </button>
                                )}
                              </div>
                              <button
                                onClick={() => setExpanded(isExpanded ? null : order._id)}
                                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                              >
                                {isExpanded ? t("myOrders.showLess") : t("myOrders.showAllItems")}
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default MyOrders;
