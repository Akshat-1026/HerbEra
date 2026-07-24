import { useState, useEffect, useContext } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { User, ShoppingBag, MapPin, Heart, Settings, Package, Calendar, Plus, Pencil, Trash2, ChevronRight, LogOut, Phone, Mail, MapPinned } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import SEO from "../components/SEO";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

function Dashboard() {
  const { userInfo, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({ label: "Home", address: "", city: "", state: "", postalCode: "", country: "India" });
  const [editingAddress, setEditingAddress] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const tabs = [
    { key: "profile", label: t("dashboard.profile"), icon: User },
    { key: "orders", label: t("dashboard.orders"), icon: ShoppingBag },
    { key: "addresses", label: t("dashboard.addresses"), icon: MapPin },
    { key: "wishlist", label: t("dashboard.wishlist"), icon: Heart },
    { key: "settings", label: t("dashboard.settings"), icon: Settings },
  ];

  useEffect(() => {
    setLoading(true); // eslint-disable-line react-hooks/set-state-in-effect
    axios.get("/api/auth/profile").then(({ data }) => {
      setProfile(data);
      setForm({ name: data.name || "", email: data.email || "", phone: data.phone || "" });
      setAddresses(data.addresses || []);
    }).catch(() => toast.error(t("dashboard.errorLoadProfile"))).finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTab !== "orders") return;
    axios.get("/api/orders/myorders").then(({ data }) => setOrders(data)).catch(() => {});
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveProfile = async () => {
    try {
      const { data } = await axios.put("/api/auth/profile", form);
      setProfile(data);
      setEditing(false);
      toast.success(t("dashboard.profileUpdated"));
    } catch { toast.error(t("dashboard.errorUpdateProfile")); }
  };

  const handleSaveAddress = async () => {
    const updated = editingAddress !== null
      ? addresses.map((a, i) => i === editingAddress ? addressForm : a)
      : [...addresses, addressForm];
    try {
      const { data } = await axios.put("/api/auth/profile", { addresses: updated });
      setAddresses(data.addresses || updated);
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({ label: "Home", address: "", city: "", state: "", postalCode: "", country: "India" });
      toast.success(editingAddress !== null ? t("dashboard.addressUpdated") : t("dashboard.addressAdded"));
    } catch { toast.error(t("dashboard.errorSaveAddress")); }
  };

  const handleDeleteAddress = async (index) => {
    const updated = addresses.filter((_, i) => i !== index);
    try {
      await axios.put("/api/auth/profile", { addresses: updated });
      setAddresses(updated);
      toast.success(t("dashboard.addressDeleted"));
    } catch { toast.error(t("dashboard.errorDeleteAddress")); }
  };

  const handleSetDefaultAddress = async (index) => {
    const updated = addresses.map((a, i) => ({ ...a, isDefault: i === index }));
    try {
      await axios.put("/api/auth/profile", { addresses: updated });
      setAddresses(updated);
      toast.success(t("dashboard.defaultAddressSet"));
    } catch { toast.error(t("dashboard.errorUpdate")); }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error(t("dashboard.passwordsDontMatch"));
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error(t("dashboard.passwordMinLength"));
    }
    try {
      await axios.put("/api/auth/profile", { password: passwordForm.newPassword });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success(t("dashboard.passwordChanged"));
    } catch { toast.error(t("dashboard.errorChangePassword")); }
  };

  if (!userInfo) return <Navigate to="/login" replace />;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f5ef] dark:bg-zinc-950 flex items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  return (

    <>
    <SEO title={t("dashboard.pageTitle")} />
    <div className="min-h-screen bg-[#f8f5ef] dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12 lg:flex lg:gap-10">
        <aside className="mb-6 lg:mb-0 lg:w-72">
          <div className="rounded-3xl bg-white p-4 shadow-md dark:bg-zinc-900 lg:p-6">
            <div className="mb-4 flex items-center gap-3 border-b border-zinc-200 pb-4 dark:border-zinc-700">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold text-lg dark:bg-green-900/40 dark:text-green-300">
                {profile?.name?.charAt(0) || t("dashboard.user")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{profile?.name || t("dashboard.user")}</p>
                <p className="text-xs text-zinc-500 truncate">{profile?.email}</p>
              </div>
            </div>
            <nav className="hidden lg:block space-y-1">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === key
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
              <button
                onClick={() => { logout(); navigate("/"); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut size={18} />
                {t("dashboard.logout")}
              </button>
            </nav>
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800"
              >
                <span className="font-medium text-sm">{tabs.find(t => t.key === activeTab)?.label}</span>
                <ChevronRight size={16} className={`transition-transform ${mobileMenuOpen ? "rotate-90" : ""}`} />
              </button>
              {mobileMenuOpen && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-2 space-y-1">
                  {tabs.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => { setActiveTab(key); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        activeTab === key
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <Icon size={18} />
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          {activeTab === "profile" && (
            <motion.div {...fadeUp()} className="rounded-3xl bg-white p-6 shadow-md dark:bg-zinc-900 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{t("dashboard.profileHeading")}</h2>
                <button
                  onClick={() => setEditing(!editing)}
                  className="flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700"
                >
                  <Pencil size={16} />
                  {editing ? t("dashboard.cancel") : t("dashboard.edit")}
                </button>
              </div>
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t("dashboard.name")}</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t("dashboard.email")}</label>
                    <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t("dashboard.phone")}</label>
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder={t("dashboard.phonePlaceholder")} />
                  </div>
                  <button onClick={handleSaveProfile} className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 transition-colors">{t("dashboard.saveChanges")}</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800">
                    <User size={20} className="text-zinc-400" />
                    <div>
                      <p className="text-xs text-zinc-500">{t("dashboard.name")}</p>
                      <p className="font-medium">{profile?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800">
                    <Mail size={20} className="text-zinc-400" />
                    <div>
                      <p className="text-xs text-zinc-500">{t("dashboard.email")}</p>
                      <p className="font-medium">{profile?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800">
                    <Phone size={20} className="text-zinc-400" />
                    <div>
                      <p className="text-xs text-zinc-500">{t("dashboard.phone")}</p>
                      <p className="font-medium">{profile?.phone || t("dashboard.notSet")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800">
                    <Calendar size={20} className="text-zinc-400" />
                    <div>
                      <p className="text-xs text-zinc-500">{t("dashboard.memberSince")}</p>
                      <p className="font-medium">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "orders" && (
            <motion.div {...fadeUp()} className="space-y-4">
              <h2 className="text-2xl font-bold mb-6">{t("dashboard.myOrders")}</h2>
              {orders.length === 0 ? (
                <div className="rounded-3xl bg-white p-12 text-center shadow-md dark:bg-zinc-900">
                  <Package size={48} className="mx-auto text-zinc-300 mb-4" />
                  <p className="text-zinc-500">{t("dashboard.noOrders")}</p>
                  <Link to="/products" className="mt-4 inline-block rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700">{t("dashboard.startShopping")}</Link>
                </div>
              ) : (
                orders.map((order) => (
                  <motion.div key={order._id} className="rounded-3xl bg-white p-6 shadow-md dark:bg-zinc-900">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <div>
                        <p className="text-xs text-zinc-500">{t("dashboard.orderPrefix")}{order._id?.slice(-8)}</p>
                        <p className="text-sm text-zinc-400 flex items-center gap-1 mt-1">
                          <Calendar size={14} /> {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.isDelivered ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" :
                          order.status === "cancelled" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" :
                          "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                        }`}>
                          {order.isDelivered ? t("dashboard.delivered") : order.status === "cancelled" ? t("dashboard.cancelled") : t("dashboard.processing")}
                        </span>
                        <span className="font-bold text-lg">₹{order.totalPrice?.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {order.orderItems?.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-2">
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <p className="text-sm font-medium">{item.name}</p>
                            {item.variantLabel && <p className="text-[11px] text-zinc-400">{item.variantLabel}</p>}
                            <p className="text-xs text-zinc-500">x{item.qty}</p>
                          </div>
                        </div>
                      ))}
                      {order.orderItems?.length > 3 && (
                        <div className="flex items-center text-sm text-zinc-500">+{order.orderItems.length - 3} more</div>
                      )}
                    </div>
                    <div className="mt-4 flex gap-3">
                      <Link to={`/track-order`} className="text-sm font-medium text-green-600 hover:text-green-700">{t("dashboard.trackOrder")}</Link>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === "addresses" && (
            <motion.div {...fadeUp()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{t("dashboard.myAddresses")}</h2>
                <button
                  onClick={() => { setShowAddressForm(true); setEditingAddress(null); setAddressForm({ label: "Home", address: "", city: "", state: "", postalCode: "", country: "India" }); }}
                  className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                >
                  <Plus size={16} /> {t("dashboard.addAddress")}
                </button>
              </div>
              {addresses.length === 0 && !showAddressForm && (
                <div className="rounded-3xl bg-white p-12 text-center shadow-md dark:bg-zinc-900">
                  <MapPin size={48} className="mx-auto text-zinc-300 mb-4" />
                  <p className="text-zinc-500">{t("dashboard.noAddresses")}</p>
                </div>
              )}
              <div className="space-y-4">
                {addresses.map((addr, i) => (
                  <div key={i} className="rounded-3xl bg-white p-6 shadow-md dark:bg-zinc-900 relative">
                    {addr.isDefault && (
                      <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">{t("dashboard.default")}</span>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <MapPinned size={16} className="text-green-600" />
                      <span className="font-semibold">{t("dashboard." + addr.label.toLowerCase())}</span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm">{addr.address}, {addr.city}, {addr.state} - {addr.postalCode}</p>
                    <p className="text-zinc-500 text-sm mt-1">{addr.country}</p>
                    <div className="flex gap-3 mt-4">
                      <button onClick={() => { setEditingAddress(i); setAddressForm(addr); setShowAddressForm(true); }} className="text-sm text-zinc-500 hover:text-green-600 flex items-center gap-1">
                        <Pencil size={14} /> {t("dashboard.edit")}
                      </button>
                      <button onClick={() => handleDeleteAddress(i)} className="text-sm text-zinc-500 hover:text-red-600 flex items-center gap-1">
                        <Trash2 size={14} /> {t("dashboard.delete")}
                      </button>
                      {!addr.isDefault && (
                        <button onClick={() => handleSetDefaultAddress(i)} className="text-sm text-zinc-500 hover:text-green-600 flex items-center gap-1">
                          <MapPin size={14} /> {t("dashboard.setDefault")}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {showAddressForm && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-white p-6 shadow-md dark:bg-zinc-900 mt-6">
                  <h3 className="font-semibold mb-4">{editingAddress !== null ? t("dashboard.editAddress") : t("dashboard.addNewAddress")}</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t("dashboard.label")}</label>
                      <select value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                        <option value="Home">{t("dashboard.home")}</option>
                        <option value="Work">{t("dashboard.work")}</option>
                        <option value="Other">{t("dashboard.other")}</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t("dashboard.address")}</label>
                      <input value={addressForm.address} onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t("dashboard.city")}</label>
                      <input value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t("dashboard.state")}</label>
                      <input value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t("dashboard.postalCode")}</label>
                      <input value={addressForm.postalCode} onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t("dashboard.country")}</label>
                      <input value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={handleSaveAddress} className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700">{t("dashboard.save")}</button>
                    <button onClick={() => setShowAddressForm(false)} className="rounded-xl border border-zinc-200 px-6 py-3 font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">{t("dashboard.cancel")}</button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === "wishlist" && (
            <motion.div {...fadeUp()} className="rounded-3xl bg-white p-8 text-center shadow-md dark:bg-zinc-900">
              <Heart size={48} className="mx-auto text-zinc-300 mb-4" />
              <p className="text-zinc-500 mb-4">{t("dashboard.wishlistDesc")}</p>
              <Link to="/Wishlist" className="inline-block rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700">{t("dashboard.goToWishlist")}</Link>
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div {...fadeUp()} className="rounded-3xl bg-white p-6 shadow-md dark:bg-zinc-900 md:p-8">
              <h2 className="text-2xl font-bold mb-6">{t("dashboard.changePassword")}</h2>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t("dashboard.newPassword")}</label>
                  <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder={t("dashboard.newPasswordPlaceholder")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t("dashboard.confirmPassword")}</label>
                  <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder={t("dashboard.confirmPasswordPlaceholder")} />
                </div>
                <button onClick={handleChangePassword} className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 transition-colors">{t("dashboard.changePasswordBtn")}</button>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
    </>
  );
}

export default Dashboard;
