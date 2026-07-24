import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, ShoppingCart, Heart, LogOut, ChevronUp, Scale } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useCart } from "../hook/CartHook";
import useWishlistHook from "../hook/WishlistHook";
import useAuth from "../hook/AuthContextHook";
import DarkModeToggle from "./DarkModeToggle";
import LanguageSwitcher from "./LanguageSwitcher";

function Navbar() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [navProducts, setNavProducts] = useState([]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/products`).then(({ data }) => setNavProducts(data)).catch(() => {});
  }, []);

  const mainNavItems = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.shop"), path: "/products", drawer: true },
    { name: t("nav.ourStory"), path: "/about" },
    { name: t("nav.journal"), path: "/journal" },
    { name: t("nav.contact"), path: "/contact" },
  ];

  const secondaryNavItems = [
    { name: t("nav.myOrders"), path: "/my-orders" },
    { name: t("nav.trackOrder"), path: "/track-order" },
  ];

  const { cart = [] } = useCart() || {};
  const { wishlist: WishlistItems = [] } = useWishlistHook();
  const { user, logout } = useAuth() || {};
  const cartCount = cart.length;
  const WishlistCount = WishlistItems.length;

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseLeave={() => setShopOpen(false)}
      className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 shadow-sm font-sans"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative">

        {/* BRAND LOGO */}
        <Link to="/" onMouseEnter={() => setShopOpen(false)} className="flex items-center gap-2.5 -ml-1">
          <img src="/images/logo.jpg" alt="Herb-Era" className="h-8 w-auto" />
          <h1 className="text-2xl font-black tracking-wide font-playfair text-gray-900 dark:text-white">
            {t("nav.brandHerb")}<span className="font-medium italic text-green-700 dark:text-green-400">{t("nav.brandEra")}</span>
          </h1>
        </Link>

        {/* DESKTOP MAIN NAVIGATION (Only displays primary links) */}
        <div className="hidden md:flex items-center gap-8">
          {mainNavItems.map((item) => (
            <motion.div key={item.name} whileHover={{ y: -1 }}>
              {item.drawer ? (
                <button
                  onClick={() => setShopOpen(!shopOpen)}
                  onMouseEnter={() => setShopOpen(true)}
                  className="text-xs uppercase tracking-widest font-semibold transition-colors duration-200 text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-white"
                >
                  {item.name}
                </button>
              ) : (
                <NavLink
                  to={item.path}
                  onMouseEnter={() => setShopOpen(false)}
                  className={({ isActive }) =>
                    `text-xs uppercase tracking-widest font-semibold transition-colors duration-200 ${
                      isActive
                        ? "text-green-700 dark:text-green-400"
                        : "text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-white"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              )}
            </motion.div>
          ))}
        </div>

        {/* DESKTOP & MOBILE CONTROLS STRIP */}
        <div className="flex items-center gap-5">
          
          {/* Desktop Utilities (Hidden on mobile) */}
          <div className="hidden md:flex items-center gap-5" onMouseEnter={() => setShopOpen(false)}>
            <LanguageSwitcher />
            <DarkModeToggle />
            
            <Link to="/Wishlist" className="relative flex items-center">
              <motion.div whileHover={{ scale: 1.05 }} className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-white transition-colors">
                <Heart size={20} />
                {WishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-sans">
                    {WishlistCount}
                  </span>
                )}
              </motion.div>
            </Link>

            <Link to="/cart" className="relative text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-white transition-colors">
              <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-1.5">
                <ShoppingCart size={20} />
                <span className="text-xs uppercase tracking-widest font-semibold tabular-nums">
                  {t("nav.cartCount", { count: cartCount })}
                </span>
              </motion.div>
            </Link>
          </div>

          {/* HAMBURGER TOGGLE BUTTON */}
          <button
            onMouseEnter={() => setShopOpen(false)}
            className="text-gray-700 dark:text-white p-1 hover:text-green-600 dark:hover:text-green-400 transition focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={t("nav.toggleMenu")}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* RESPONSIVE DROPDOWN DRAWER */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-t md:border border-gray-100 dark:border-gray-800 px-6 py-6 space-y-4 shadow-xl md:left-auto md:right-6 md:w-56 md:rounded-xl md:mt-2 z-40"
            >
              <div className="flex flex-col gap-4 md:hidden">
                {mainNavItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `text-sm uppercase tracking-wider font-semibold ${
                        isActive ? "text-green-700 dark:text-green-400" : "text-gray-600 dark:text-gray-300"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}

              </div>

              <div className="h-px bg-gray-100 dark:bg-gray-800 my-2 md:hidden" />

              <div className="flex flex-col gap-4 md:gap-3.5">
                {secondaryNavItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `text-sm md:text-xs uppercase tracking-wider md:tracking-widest font-semibold transition-colors duration-200 ${
                        isActive
                          ? "text-green-700 dark:text-green-400"
                          : "text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-white"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}

                <NavLink
                  to="/compare"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `text-sm md:text-xs uppercase tracking-wider md:tracking-widest font-semibold transition-colors duration-200 ${
                      isActive
                        ? "text-green-700 dark:text-green-400"
                        : "text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-white"
                    }`
                  }
                >
                  Compare
                </NavLink>

                {user ? (
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-sm md:text-xs uppercase tracking-wider md:tracking-widest font-semibold text-red-600 dark:text-red-400 text-left hover:text-red-700 dark:hover:text-red-300 transition-colors"
                  >
                    <LogOut size={16} className="md:hidden" /> {t("nav.logout")}
                  </button>
                ) : (
                  <NavLink
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `text-sm md:text-xs uppercase tracking-wider md:tracking-widest font-semibold transition-colors duration-200 ${
                        isActive 
                          ? "text-green-700 dark:text-green-400" 
                          : "text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-white"
                      }`
                    }
                  >
                    {t("nav.loginRegister")}
                  </NavLink>
                )}
              </div>

              <div className="flex items-center gap-6 border-t border-gray-100 dark:border-gray-800 pt-4 md:hidden">
                <LanguageSwitcher />
                <DarkModeToggle />

                <Link to="/Wishlist" onClick={() => setMenuOpen(false)} className="relative">
                  <Heart className="text-gray-600 dark:text-gray-300" size={22} />
                  {WishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-sans">
                      {WishlistCount}
                    </span>
                  )}
                </Link>

                <Link to="/compare" onClick={() => setMenuOpen(false)} className="relative">
                  <Scale className="text-gray-600 dark:text-gray-300" size={22} />
                </Link>

                <Link to="/cart" onClick={() => setMenuOpen(false)} className="relative flex items-center gap-1.5">
                  <ShoppingCart className="text-gray-600 dark:text-gray-300" size={22} />
                  <span className="text-xs uppercase tracking-wider font-semibold text-gray-600 dark:text-gray-300">
                  {t("nav.cartCount", { count: cartCount })}
                  </span>
                </Link>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SHOP DROPDOWN */}
      <AnimatePresence>
        {shopOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-40 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl"
            onMouseLeave={() => setShopOpen(false)}
          >
            <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6 md:flex-row md:gap-12">
              <div className="hidden md:flex flex-col gap-1 min-w-48">
                <NavLink
                  to="/products"
                  onClick={() => setShopOpen(false)}
                  className="flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-semibold text-zinc-900 dark:text-white bg-emerald-50 dark:bg-emerald-900/20"
                >
                  {t("nav.allProducts")}
                  <ChevronUp size={16} className="text-emerald-600 dark:text-emerald-400" />
                </NavLink>
                <NavLink
                  to="/products?filter=bestseller"
                  onClick={() => setShopOpen(false)}
                  className="rounded-lg px-4 py-2.5 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  {t("nav.bestsellers")}
                </NavLink>
                <NavLink
                  to="/products?filter=new"
                  onClick={() => setShopOpen(false)}
                  className="rounded-lg px-4 py-2.5 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  {t("nav.newLaunches")}
                </NavLink>
                <NavLink
                  to="/products?filter=combo"
                  onClick={() => setShopOpen(false)}
                  className="rounded-lg px-4 py-2.5 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  {t("nav.combos")}
                </NavLink>
                <div className="my-2 border-t border-zinc-200 dark:border-zinc-800" />
                <NavLink
                  to="/products"
                  onClick={() => setShopOpen(false)}
                  className="rounded-lg px-4 py-2.5 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  {t("nav.shopAll")}
                </NavLink>
              </div>
              <div className="flex md:flex-col gap-3 flex-1 max-h-[420px] overflow-x-auto md:overflow-y-auto md:overflow-x-hidden pr-1 scrollbar-hide">
                {navProducts.map((p) => {
                  const stars = Math.round(p.rating || 0);
                  return (
                    <Link
                      key={p._id}
                      to={`/products/${p._id}`}
                      onClick={() => setShopOpen(false)}
                      className="group flex items-center gap-3 rounded-xl border border-[#ECECEC] bg-white px-3.5 py-3 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-zinc-500 shrink-0 md:shrink"
                    >
                      <div className="relative h-[80px] w-[80px] shrink-0 overflow-hidden rounded-[10px] bg-gradient-to-br from-emerald-50 to-zinc-100 dark:from-emerald-950/30 dark:to-zinc-800">
                        <img
                          src={p.image}
                          alt={p.name}
                          loading="lazy"
                          className="h-full w-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
                      </div>
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-medium uppercase tracking-[1px] text-emerald-600 dark:text-emerald-400">
                            {p.category || "Ayurvedic"}
                          </p>
                          <h3 className="mt-0.5 truncate text-sm font-semibold text-zinc-900 dark:text-white">
                            {p.name}
                          </h3>
                          <span className="text-sm font-bold text-zinc-900 dark:text-white">
                            ₹{p.price}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-1 rounded-md bg-amber-50 px-2 py-1 dark:bg-amber-900/20">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-amber-500">
                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                          </svg>
                          <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">{stars}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default Navbar;
