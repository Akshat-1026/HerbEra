import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  PackageSearch, Check, X, Clock, Truck,
  Package, MapPin, CreditCard,
  AlertTriangle, Calendar, Hash, IndianRupee,
  Loader2, ChevronRight
} from "lucide-react";
import { useTranslation } from "react-i18next";
import SEO from "../components/SEO";
import { useCurrency } from "../context/CurrencyContext";

function CheckCircle({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

const steps = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered"];
const stepIcons = [Clock, CheckCircle, PackageSearch, Truck, CheckCircle];

const fadeUpItem = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" }
  })
};

function getStatusDate(order, status) {
  const key = status.toLowerCase() + "At";
  if (order[key]) return new Date(order[key]);
  if (status === "Pending" && order.createdAt) return new Date(order.createdAt);
  if (order.timeline) {
    const entry = order.timeline.find((t) => t.status?.toLowerCase() === status.toLowerCase());
    if (entry?.date) return new Date(entry.date);
  }
  return null;
}

function formatDate(date) {
  if (!date) return "";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function TrackOrder() {
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get("tracking") || "");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleTrack = async (num) => {
    const tn = num || trackingNumber;
    if (!tn.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/orders/track/${tn}`
      );
      setOrder(data);
    } catch {
      setError(t("trackOrder.notFound"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const trackingParam = searchParams.get("tracking");
    if (trackingParam) {
      setTrackingNumber(trackingParam); // eslint-disable-line react-hooks/set-state-in-effect
      handleTrack(trackingParam);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const statusIndex = useMemo(() => {
    if (!order) return -1;
    if (order.status === "cancelled") return -1;
    const idx = steps.findIndex((s) => s.toLowerCase() === (order.status || "").toLowerCase());
    if (order.isDelivered || order.status === "delivered") return steps.indexOf("Delivered");
    return idx >= 0 ? idx : 0;
  }, [order]);

  const canCancel = useMemo(() => {
    if (!order) return false;
    const s = (order.status || "").toLowerCase();
    if (s === "delivered" || s === "cancelled") return false;
    const createdAt = new Date(order.createdAt);
    const now = new Date();
    return (now - createdAt) < 24 * 60 * 60 * 1000;
  }, [order]);

  const isCancelled = order?.status === "cancelled";

  const handleCancel = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/orders/${order._id}/cancel`);
      setOrder(prev => ({ ...prev, status: "cancelled" }));
      setShowCancelConfirm(false);
    } catch {
      setError(t("trackOrder.errorCancel"));
    } finally {
      setCancelling(false);
    }
  };

  return (

    <>
    <SEO title={t("trackOrder.pageTitle")} />
    <div className="min-h-screen bg-[#f8f5ef] dark:bg-zinc-950 px-6 py-12 md:py-16">
      <div className="mx-auto max-w-3xl">

        <div className="mb-10 text-center">
          <PackageSearch className="mx-auto text-green-600 dark:text-green-400" size={48} strokeWidth={1.5} />
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-zinc-800 dark:text-white font-playfair">
            {t("trackOrder.heading")}
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            {t("trackOrder.description")}
          </p>
        </div>

        <div className="flex gap-3">
          <input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTrack()}
            placeholder={t("trackOrder.inputPlaceholder")}
            className="flex-1 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-5 py-4 text-zinc-900 dark:text-white outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:border-green-500 dark:focus:ring-green-800"
          />
          <button
            onClick={() => handleTrack()}
            disabled={loading || !trackingNumber.trim()}
            className="rounded-2xl bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 px-8 py-4 font-semibold text-white transition flex items-center gap-2"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <PackageSearch size={20} />}
            {loading ? t("trackOrder.tracking") : t("trackOrder.track")}
          </button>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center text-red-500"
          >
            {error}
          </motion.p>
        )}

        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 space-y-6"
          >

            <div className="rounded-3xl bg-white dark:bg-zinc-900 shadow-md p-5 md:p-8">
              <h2 className="text-lg font-semibold text-zinc-800 dark:text-white mb-6">
                {t("trackOrder.orderJourney")}
              </h2>

              {isCancelled ? (
                <div className="flex flex-col items-center py-8">
                  <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                    <X size={32} className="text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">{t("trackOrder.orderCancelled")}</p>
                  {order.updatedAt && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                      {formatDate(new Date(order.updatedAt))}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  {steps.map((step, i) => {
                    const isCompleted = i < statusIndex;
                    const isCurrent = i === statusIndex;
                    const notLast = i < steps.length - 1;
                    const Icon = stepIcons[i];
                    const stepDate = getStatusDate(order, step);

                    return (
                      <motion.div
                        key={step}
                        custom={i}
                        variants={fadeUpItem}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="flex flex-col items-start md:items-center"
                      >
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
                            isCompleted
                              ? "bg-green-600 text-white shadow-md shadow-green-200 dark:shadow-green-900"
                              : isCurrent
                                ? "border-2 border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-600"
                                : "border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-400"
                          }`}>
                            {isCompleted ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
                          </div>
                          <div className="ml-4 md:hidden">
                            <p className={`text-sm font-semibold ${
                              isCompleted ? "text-green-600" : isCurrent ? "text-amber-600" : "text-zinc-400 dark:text-zinc-500"
                            }`}>
                              {t("trackOrder." + step.toLowerCase())}
                            </p>
                            {stepDate && (
                              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{formatDate(stepDate)}</p>
                            )}
                          </div>
                          {notLast && (
                            <div className={`hidden md:block w-12 h-0.5 mx-1 rounded-full transition-colors duration-300 ${
                              isCompleted ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-700"
                            }`} />
                          )}
                        </div>
                        {notLast && (
                          <div className={`md:hidden ml-5 w-0.5 h-10 rounded-full transition-colors duration-300 ${
                            isCompleted ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-700"
                          }`} />
                        )}
                        <div className="hidden md:block md:mt-2 md:text-center">
                          <p className={`text-sm font-semibold ${
                            isCompleted ? "text-green-600" : isCurrent ? "text-amber-600" : "text-zinc-400 dark:text-zinc-500"
                          }`}>
                            {t("trackOrder." + step.toLowerCase())}
                          </p>
                          {stepDate && (
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{formatDate(stepDate)}</p>
                          )}
                          {isCurrent && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-[10px] font-semibold">
                              {t("trackOrder.current")}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white dark:bg-zinc-900 shadow-md p-5 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-zinc-800 dark:text-white">
                  {t("trackOrder.orderDetails")}
                </h2>
                {isCancelled && (
                  <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 text-xs font-semibold">
                    {t("trackOrder.orderCancelled")}
                  </span>
                )}
                {!isCancelled && order.status === "Delivered" && (
                  <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 text-xs font-semibold">
                    {t("trackOrder.delivered")}
                  </span>
                )}
                {!isCancelled && order.status !== "Delivered" && (
                  <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-xs font-semibold capitalize">
                    {order.status}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <Hash size={12} /> {t("trackOrder.trackingNo")}
                  </p>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-1 font-mono">
                    {order.trackingNumber || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <Calendar size={12} /> {t("trackOrder.date")}
                  </p>
                  <p className="text-sm font-medium text-zinc-800 dark:text-white mt-1">
                    {order.createdAt ? formatDate(new Date(order.createdAt)) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <IndianRupee size={12} /> {t("trackOrder.total")}
                  </p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">
                    {formatPrice(order.totalPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <Truck size={12} /> {t("trackOrder.estDelivery")}
                  </p>
                  <p className="text-sm font-medium text-zinc-800 dark:text-white mt-1">
                    {order.estimatedDelivery
                      ? formatDate(new Date(order.estimatedDelivery))
                      : t("trackOrder.defaultEstimate")}
                  </p>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 mb-6">
                  <h3 className="text-sm font-semibold text-zinc-800 dark:text-white mb-4">
                    {t("trackOrder.items", { count: order.items.length })}
                  </h3>
                  <div className="space-y-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            <Package size={20} className="text-zinc-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-800 dark:text-white truncate">
                            {item.name}
                          </p>
                          {item.variantLabel && <p className="text-[11px] text-zinc-400">{item.variantLabel}</p>}
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Qty: {item.qty || item.quantity || 1}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-zinc-800 dark:text-white">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!order.items || order.items.length === 0) && order.orderItems && order.orderItems.length > 0 && (
                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 mb-6">
                  <h3 className="text-sm font-semibold text-zinc-800 dark:text-white mb-4">
                    {t("trackOrder.items", { count: order.orderItems.length })}
                  </h3>
                  <div className="space-y-3">
                    {order.orderItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            <Package size={20} className="text-zinc-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-800 dark:text-white truncate">
                            {item.name}
                          </p>
                          {item.variantLabel && <p className="text-[11px] text-zinc-400">{item.variantLabel}</p>}
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Qty: {item.qty || item.quantity || 1}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-zinc-800 dark:text-white">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 space-y-4">
                {order.shippingAddress && (
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mb-1">
                      <MapPin size={12} /> {t("trackOrder.shippingAddress")}
                    </p>
                    <p className="text-sm text-zinc-800 dark:text-white">
                      {order.shippingAddress.name && <>{order.shippingAddress.name}<br /></>}
                      {order.shippingAddress.address}
                      {order.shippingAddress.city && `, ${order.shippingAddress.city}`}
                      {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
                      <br />
                      {order.shippingAddress.phone}
                      {order.shippingAddress.postalCode && ` — ${order.shippingAddress.postalCode}`}
                    </p>
                  </div>
                )}
                {order.paymentMethod && (
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mb-1">
                      <CreditCard size={12} /> {t("trackOrder.paymentMethod")}
                    </p>
                    <p className="text-sm font-medium text-zinc-800 dark:text-white capitalize">
                      {order.paymentMethod}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {canCancel && (
              <div className="text-center">
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="px-6 py-3 rounded-2xl border border-red-300 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition inline-flex items-center gap-2"
                >
                  <X size={16} />
                  {t("trackOrder.cancelOrder")}
                </button>
              </div>
            )}

          </motion.div>
        )}

        {!order && !loading && !error && (
          <div className="mt-16 text-center">
            <Truck size={64} className="mx-auto text-zinc-300 dark:text-zinc-700" strokeWidth={1} />
            <p className="mt-4 text-zinc-400 dark:text-zinc-600">
              {t("trackOrder.initialPrompt")}
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-1 font-medium text-green-600 hover:text-green-700 transition"
          >
            {t("trackOrder.continueShopping")} <ChevronRight size={16} />
          </Link>
        </div>

      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl"
          >
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-zinc-800 dark:text-white text-center mb-2">
              {t("trackOrder.cancelModalHeading")}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-6">
              {t("trackOrder.cancelModalDesc")}
            </p>
        <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelling}
                className="flex-1 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition disabled:opacity-50"
              >
                {t("trackOrder.keepOrder")}
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelling ? <Loader2 size={18} className="animate-spin" /> : <X size={18} />}
                {cancelling ? t("trackOrder.cancelling") : t("trackOrder.yesCancel")}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
    </>
  );
}

export default TrackOrder;
