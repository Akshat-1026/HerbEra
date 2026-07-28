import { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useCart } from "../hook/CartHook";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import SEO from "../components/SEO";
import { CreditCard, MapPin, Tag, X } from "lucide-react";
import { useCoupon } from "../context/CouponContext";
import { AuthContext } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || "";

function Checkout() {
  const { t } = useTranslation();
  const { cart, totalPrice, clearCart } = useCart();
  const { discount, couponCode, applyCoupon, removeCoupon, validating } = useCoupon();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [serverPricing, setServerPricing] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: userInfo?.name || "",
    email: userInfo?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    if (!userInfo) {
      toast.error(t("checkout.loginRequired") || "Please login to place an order");
      navigate("/login");
    }
  }, [userInfo, navigate, t]);

  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  useEffect(() => {
    if (cart.length === 0) { setServerPricing(null); return; }

    const fetchPricing = async () => {
      setPricingLoading(true);
      try {
        const orderItems = cart.map((item) => ({
          product: item._id,
          name: item.name,
          price: item.price,
          qty: item.qty,
          image: item.image || "",
          sku: item.sku || "",
          selectedVariant: item.selectedVariant || undefined,
        }));
        const { data } = await axios.post(`${API}/orders/calculate-pricing`, {
          orderItems,
          couponCode: couponCode || undefined,
        });
        setServerPricing(data);
      } catch {
        setServerPricing(null);
      } finally {
        setPricingLoading(false);
      }
    };

    const timer = setTimeout(fetchPricing, 300);
    return () => clearTimeout(timer);
  }, [cart, couponCode, discount]); // eslint-disable-line react-hooks/exhaustive-deps

  const validateForm = () => {
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      toast.error(t("checkout.fillRequiredFields"));
      return false;
    }
    if (cart.length === 0) {
      toast.error(t("checkout.cartEmpty"));
      return false;
    }
    return true;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async (savedOrder) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error(t("checkout.paymentGatewayFailed"));
      return;
    }

    try {
      const { data } = await axios.post(`${API}/payment/create-order`, { orderId: savedOrder._id }, { withCredentials: true });

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Herb-Era",
        description: `Order #${savedOrder.trackingNumber}`,
        order_id: data.id,
        prefill: { name: formData.name, email: formData.email, contact: formData.phone },
        theme: { color: "#15803d" },
        handler: async function (response) {
          try {
            await axios.post(`${API}/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: savedOrder._id,
            }, { withCredentials: true });
            clearCart();
            toast.success(t("checkout.paymentSuccessful"));
            navigate(`/track-order?tracking=${savedOrder.trackingNumber}`);
          } catch {
            toast.error(t("checkout.paymentVerificationFailed"));
          }
        },
        modal: {
          ondismiss: () => toast.info(t("checkout.paymentCancelled")),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      toast.error(t("checkout.paymentInitFailed"));
    }
  };

  const handleApplyCoupon = async () => {
    const msg = await applyCoupon(couponInput);
    if (msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("enter") || msg.toLowerCase().includes("failed")) {
      toast.error(msg);
    } else {
      toast.success(msg);
    }
    setCouponInput("");
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const orderItems = cart.map((item) => ({
        product: item._id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        image: item.image || "",
        sku: item.sku || "",
      }));

      const orderData = {
        orderItems,
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.pincode,
          country: "India",
          state: formData.state || "",
        },
        paymentMethod: paymentMethod === "razorpay" ? "Razorpay" : "COD",
        couponCode: couponCode || undefined,
      };

      const { data: savedOrder } = await axios.post(`${API}/orders`, orderData, { withCredentials: true });

      if (paymentMethod === "razorpay" && RAZORPAY_KEY) {
        await handleRazorpayPayment(savedOrder);
      } else {
        clearCart();
        toast.success(t("checkout.orderPlaced"));
        navigate(`/track-order?tracking=${savedOrder.trackingNumber}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("checkout.orderFailed"));
    } finally {
      setLoading(false);
    }
  };

  const subtotal = serverPricing?.subtotal ?? totalPrice;
  const couponDiscountValue = serverPricing?.discountAmount ?? (subtotal * (discount / 100));
  const afterCoupon = serverPricing?.afterDiscount ?? (subtotal - couponDiscountValue);
  const shipping = serverPricing?.shippingPrice ?? (afterCoupon >= 500 ? 0 : 49);
  const gst = serverPricing?.gstAmount ?? (afterCoupon * 0.05);
  const finalTotal = serverPricing?.total ?? (afterCoupon + shipping + gst);

  return (
    <>
      <SEO title={t("checkout.pageTitle")} />
      <div className="min-h-screen bg-[#F8F4EF] dark:bg-zinc-950">
        <div className="relative bg-linear-to-br from-green-900 via-green-800 to-emerald-900 text-white px-4 py-10 md:py-14">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl">
            <h1 className="text-3xl md:text-4xl font-bold">{t("checkout.heading")}</h1>
            <p className="text-emerald-200 mt-2">{t("checkout.subheading")}</p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <MapPin size={20} className="text-green-600" />
                  {t("checkout.shippingDetails")}
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">{t("checkout.fullName")} *</label>
                    <input name="name" value={formData.name} onChange={handleChange} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white" placeholder={t("checkout.fullNamePlaceholder")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">{t("checkout.email")}</label>
                    <input name="email" value={formData.email} onChange={handleChange} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white" placeholder={t("checkout.emailPlaceholder")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">{t("checkout.phone")} *</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white" placeholder={t("checkout.phonePlaceholder")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">{t("checkout.city")} *</label>
                    <input name="city" value={formData.city} onChange={handleChange} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white" placeholder={t("checkout.cityPlaceholder")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">State *</label>
                    <input name="state" value={formData.state} onChange={handleChange} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white" placeholder="e.g. Maharashtra" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">{t("checkout.pincode")} *</label>
                    <input name="pincode" value={formData.pincode} onChange={handleChange} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white" placeholder={t("checkout.pincodePlaceholder")} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">{t("checkout.address")} *</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white resize-none" placeholder={t("checkout.addressPlaceholder")} />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <CreditCard size={20} className="text-green-600" />
                  {t("checkout.paymentMethod")}
                </h2>
                <div className="space-y-3">
                  {RAZORPAY_KEY && (
                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === "razorpay" ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"}`}>
                      <input type="radio" name="payment" value="razorpay" checked={paymentMethod === "razorpay"} onChange={() => setPaymentMethod("razorpay")} className="accent-green-600" />
                      <div>
                        <p className="font-medium">{t("checkout.payOnline")}</p>
                        <p className="text-xs text-zinc-500">{t("checkout.payOnlineDesc")}</p>
                      </div>
                    </label>
                  )}
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === "cod" ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"}`}>
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="accent-green-600" />
                    <div>
                      <p className="font-medium">{t("checkout.cod")}</p>
                      <p className="text-xs text-zinc-500">{t("checkout.codDesc")}</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 md:p-8 shadow-sm sticky top-24">
                <h2 className="text-xl font-bold mb-6">{t("checkout.orderSummary")}</h2>
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div key={item._id} className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        {item.selectedVariant?.label && <p className="text-[11px] text-zinc-400">{item.selectedVariant.label}</p>}
                        <p className="text-xs text-zinc-500">{t("cart.qty")}: {item.qty}</p>
                      </div>
                      <p className="text-sm font-semibold">{formatPrice(item.price * item.qty)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
                    <span>{t("checkout.subtotal")}</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {couponCode && discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                      <span>{t("cart.discount", { code: couponCode })}</span>
                      <span>-{formatPrice(couponDiscountValue)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
                    <span>{t("checkout.shipping")}</span>
                    <span>{shipping === 0 ? t("checkout.free") : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
                    <span>GST (5%)</span>
                    <span>{formatPrice(gst)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-zinc-200 dark:border-zinc-700">
                    <span>{t("checkout.total")}</span>
                    <span className="text-green-600">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {couponCode ? (
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-green-50 px-4 py-3 dark:bg-green-900/20">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">{couponCode} ({discount}% OFF)</span>
                    </div>
                    <button onClick={removeCoupon} className="rounded-lg p-1 text-zinc-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"><X size={16} /></button>
                  </div>
                ) : (
                  <div className="mt-4">
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
                        disabled={validating}
                        className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                      >
                        {validating ? "..." : t("cart.apply")}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || pricingLoading}
                  className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t("checkout.processing")}
                    </span>
                  ) : pricingLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Calculating...
                    </span>
                  ) : (
                    `${t("checkout.placeOrder")} ${formatPrice(finalTotal)}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Checkout;
