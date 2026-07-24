import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Minus, Plus, Trash2, ShoppingBag, Tag, Lock, Clock, Bookmark, X, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useCart } from "../hook/CartHook";
import { useCoupon } from "../context/CouponContext";
import SEO from "../components/SEO";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

const stagger = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, staggerChildren: 0.08 },
};

function getEstimatedDelivery() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function Cart() {
  const { t } = useTranslation();
  const { cart, increaseQty, decreaseQty, removeFromCart, addToCart, totalPrice } = useCart();
  const { discount, couponCode, applyCoupon, removeCoupon } = useCoupon();

  const [couponInput, setCouponInput] = useState("");

  const [savedItems, setSavedItems] = useState(() => {
    try {
      const raw = localStorage.getItem("herbEraSaved");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("herbEraSaved", JSON.stringify(savedItems));
  }, [savedItems]);

  const handleApplyCoupon = async () => {
    const msg = await applyCoupon(couponInput);
    if (msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("enter") || msg.toLowerCase().includes("failed")) {
      toast.error(msg);
    } else {
      toast.success(msg);
    }
    setCouponInput("");
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast.error(t("cart.couponRemoved"));
  };

  const saveForLater = (item) => {
    removeFromCart(item._cartId);
    setSavedItems((prev) => {
      const exists = prev.find((i) => i._id === item._id && i.selectedVariant?.label === item.selectedVariant?.label);
      if (exists) {
        return prev.map((i) =>
          i._id === item._id && i.selectedVariant?.label === item.selectedVariant?.label
            ? { ...i, qty: i.qty + item.qty } : i
        );
      }
      return [...prev, { ...item }];
    });
    toast.success(t("cart.savedForLaterToast"));
  };

  const moveToCart = (item) => {
    setSavedItems((prev) => prev.filter((i) => i._id !== item._id || i.selectedVariant?.label !== item.selectedVariant?.label));
    addToCart({ ...item, selectedVariant: item.selectedVariant });
    toast.success(t("cart.movedToCart"));
  };

  const removeSaved = (id) => {
    setSavedItems((prev) => prev.filter((i) => i._id !== id));
    toast(t("cart.removedFromSaved"));
  };

  const subtotal = totalPrice;
  const couponDiscountValue = subtotal * (discount / 100);
  const afterCoupon = subtotal - couponDiscountValue;
  const shipping = afterCoupon >= 500 ? 0 : 49;
  const gst = afterCoupon * 0.05;
  const finalTotal = afterCoupon + shipping + gst;
  const estimatedDelivery = getEstimatedDelivery();
  const isEmpty = cart.length === 0 && savedItems.length === 0;

  return (

    <>
    <SEO title={t("cart.pageTitle")} />
    <div className="min-h-screen bg-[#f8f5ef] dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex items-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/40">
            <ShoppingBag className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-zinc-800 dark:text-white sm:text-4xl">
              {t("cart.heading")}
            </h1>
            {!isEmpty && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {t("cart.itemsLabel", { count: cart.length })}
              </p>
            )}
          </div>
        </motion.div>

        {isEmpty ? (
          <motion.div {...fadeUp(0.1)} className="py-24 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <ShoppingBag className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-zinc-800 dark:text-white">
              {t("cart.empty")}
            </h2>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              {t("cart.emptyDesc")}
            </p>
            <Link
              to="/products"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-green-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 hover:shadow-xl hover:shadow-green-600/30"
            >
              {t("cart.exploreProducts")}
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              {cart.length > 0 && (
                <motion.div
                  initial="initial"
                  whileInView="whileInView"
                  viewport={{ once: true }}
                  variants={stagger}
                  className="space-y-4"
                >
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-700 dark:text-zinc-300">
                    <ShoppingBag className="h-4 w-4" />
                    {t("cart.cartItems", { count: cart.length })}
                  </h2>
                  {cart.map((item) => (
                    <motion.div
                      key={item._cartId}
                      variants={{
                        initial: { opacity: 0, y: 30 },
                        whileInView: { opacity: 1, y: 0 },
                      }}
                      className="rounded-3xl bg-white shadow-md dark:bg-zinc-900"
                    >
                      <div className="flex flex-col gap-4 p-5 md:flex-row">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-36 w-full rounded-2xl object-cover md:w-36"
                        />
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-zinc-800 dark:text-white">
                              {item.name}
                            </h3>
                            {item.selectedVariant?.label && (
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{item.selectedVariant.label}</p>
                            )}
                            {item.sku && (
                              <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 mt-0.5">SKU: {item.sku}</p>
                            )}
                            <p className="mt-1 font-semibold text-green-600 dark:text-green-400">
                              ₹{item.price}
                            </p>
                          </div>
                          <div className="mt-4 flex items-center gap-3">
                            <button
                              onClick={() => decreaseQty(item._cartId)}
                              className="rounded-xl bg-zinc-100 p-2.5 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                            >
                              <Minus size={16} className="text-zinc-600 dark:text-zinc-400" />
                            </button>
                            <span className="min-w-[2rem] text-center font-semibold text-zinc-800 dark:text-white">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => increaseQty(item._cartId)}
                              className="rounded-xl bg-zinc-100 p-2.5 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                            >
                              <Plus size={16} className="text-zinc-600 dark:text-zinc-400" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-row items-center justify-between gap-3 md:flex-col md:items-end md:justify-between">
                          <p className="text-xl font-extrabold text-green-600 dark:text-green-400">
                            ₹{item.price * item.qty}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveForLater(item)}
                              className="rounded-xl border border-zinc-200 p-2.5 text-zinc-400 transition hover:border-green-200 hover:text-green-600 dark:border-zinc-700 dark:hover:border-green-700 dark:hover:text-green-400"
                              title={t("cart.saveForLater")}
                            >
                              <Bookmark size={16} />
                            </button>
                            <button
                              onClick={() => { removeFromCart(item._cartId); toast.error(t("cart.removed")); }}
                              className="rounded-xl border border-zinc-200 p-2.5 text-red-400 transition hover:border-red-200 hover:text-red-600 dark:border-zinc-700 dark:hover:border-red-700 dark:hover:text-red-400"
                              title={t("cart.remove")}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {cart.length === 0 && (
                <div className="rounded-3xl bg-white p-8 text-center shadow-md dark:bg-zinc-900">
                  <ShoppingBag className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-600" />
                  <p className="mt-3 text-zinc-500 dark:text-zinc-400">
                    {t("cart.empty")}{" "}
                    <Link to="/products" className="font-medium text-green-600 underline underline-offset-2 dark:text-green-400">
                      {t("cart.browseProducts")}
                    </Link>
                  </p>
                </div>
              )}

              {savedItems.length > 0 && (
                <motion.div
                  initial="initial"
                  whileInView="whileInView"
                  viewport={{ once: true }}
                  variants={stagger}
                  className="space-y-4"
                >
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-700 dark:text-zinc-300">
                    <Bookmark className="h-4 w-4" />
                    {t("cart.savedForLater", { count: savedItems.length })}
                  </h2>
                  {savedItems.map((item) => (
                    <motion.div
                      key={item._id}
                      variants={{
                        initial: { opacity: 0, y: 30 },
                        whileInView: { opacity: 1, y: 0 },
                      }}
                      className="rounded-3xl bg-white/60 shadow-md backdrop-blur-sm dark:bg-zinc-900/80"
                    >
                      <div className="flex flex-col gap-4 p-5 md:flex-row">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-28 w-full rounded-2xl object-cover opacity-80 md:w-28"
                        />
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <h3 className="text-base font-bold text-zinc-700 dark:text-zinc-300">
                              {item.name}
                            </h3>
                            {item.selectedVariant?.label && (
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.selectedVariant.label}</p>
                            )}
                            <p className="mt-1 font-semibold text-green-600 dark:text-green-400">
                              ₹{item.price}
                            </p>
                          </div>
                          <div className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
                            <span>{t("cart.qty")}: {item.qty}</span>
                          </div>
                        </div>
                        <div className="flex flex-row items-center justify-end gap-2 md:flex-col md:justify-center">
                          <button
                            onClick={() => moveToCart(item)}
                            className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                          >
                            {t("cart.moveToCart")}
                          </button>
                          <button
                            onClick={() => removeSaved(item._id)}
                            className="rounded-xl border border-zinc-200 p-2.5 text-red-400 transition hover:border-red-200 hover:text-red-600 dark:border-zinc-700 dark:hover:border-red-700"
                            title={t("cart.remove")}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="sticky top-24 rounded-3xl bg-white shadow-xl dark:bg-zinc-900"
                >
                  <div className="p-8">
                    <h2 className="mb-6 font-serif text-xl font-bold text-zinc-800 dark:text-white">
                      {t("cart.orderSummary")}
                    </h2>

                    <div className="space-y-4">
                      <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                        <span>{t("cart.subtotal")}</span>
                        <span className="font-medium text-zinc-800 dark:text-white">₹{subtotal.toFixed(0)}</span>
                      </div>

                      {couponCode && discount > 0 && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                          <span>{t("cart.discount", { code: couponCode })}</span>
                          <span>-₹{couponDiscountValue.toFixed(0)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                        <span className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          {t("cart.shipping")}
                        </span>
                        <span className={shipping === 0 ? "font-semibold text-green-600 dark:text-green-400" : ""}>
                          {shipping === 0 ? t("cart.free") : `₹${shipping}`}
                        </span>
                      </div>

                      <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                        <span>{t("cart.gst")}</span>
                        <span>₹{gst.toFixed(0)}</span>
                      </div>
                    </div>

                    <div className="my-5 border-t border-zinc-100 dark:border-zinc-800" />

                    <div className="flex items-center justify-between text-2xl font-bold text-zinc-800 dark:text-white">
                      <span>{t("cart.total")}</span>
                      <span className="text-green-600 dark:text-green-400">₹{finalTotal.toFixed(0)}</span>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm text-zinc-400">
                      <Clock className="h-4 w-4" />
                      <span>{t("cart.estimatedDelivery")}: {estimatedDelivery}</span>
                    </div>

                    <div className="mt-6 border-t border-zinc-100 pt-6 dark:border-zinc-800">
                      {couponCode ? (
                        <div className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-3 dark:bg-green-900/20">
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">
                              {t("cart.couponBadge", { code: couponCode, discount })}
                            </span>
                          </div>
                          <button
                            onClick={handleRemoveCoupon}
                            className="rounded-lg p-1 text-zinc-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <label className="mb-2.5 flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                            <Tag className="h-4 w-4" />
                            {t("cart.haveCoupon")}
                          </label>
                          <div className="flex gap-2">
                            <input
                              value={couponInput}
                              onChange={(e) => setCouponInput(e.target.value)}
                              placeholder={t("cart.enterCode")}
                              className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-green-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-green-500"
                              onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                            />
                            <button
                              onClick={handleApplyCoupon}
                              className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                            >
                              {t("cart.apply")}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <Link
                      to="/checkout"
                      className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 text-center font-semibold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 hover:shadow-xl hover:shadow-green-600/30"
                    >
                      {t("cart.proceedToCheckout")}
                    </Link>

                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-400">
                      <Lock className="h-3 w-3" />
                      <span>{t("cart.secureCheckout")}</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        )}

        {!isEmpty && cart.length === 0 && savedItems.length > 0 && (
          <motion.div {...fadeUp(0.2)} className="mt-8 text-center">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-medium text-green-600 transition hover:gap-3 dark:text-green-400"
            >
              {t("cart.continueShopping")}
            </Link>
          </motion.div>
        )}

        {!isEmpty && cart.length > 0 && (
          <motion.div {...fadeUp(0.3)} className="mt-10 text-center">
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-all hover:gap-3 hover:text-green-600 dark:text-zinc-400 dark:hover:text-green-400"
            >
              {t("cart.continueShopping")}
            </Link>
          </motion.div>
        )}
      </div>
    </div>
    </>
  );
}

export default Cart;
