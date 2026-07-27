import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useContext, Suspense } from "react";
import { motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthContext } from "./context/AuthContext";
import { AdminProvider as AdminContextProvider } from "./context/AdminContext";
import useAutoRefresh from "./hook/useAutoRefresh";

/* COMPONENTS */
import AnnouncementBar from "./components/AnnouncementBar";
import PremiumBenefitsBar from "./components/PremiumBenefitsBar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";
import WhatsAppButton from "./components/WhatsAppButton";
import CookieConsent from "./components/CookieConsent";
import Analytics from "./components/Analytics";

/* ALL PAGES LAZY-LOADED */
const Home = React.lazy(() => import("./pages/Home"));
const Products = React.lazy(() => import("./pages/products"));
const ProductDetails = React.lazy(() => import("./pages/ProductDetails"));
const CategoryProducts = React.lazy(() => import("./pages/CategoryProducts"));
const Search = React.lazy(() => import("./pages/Search"));
const About = React.lazy(() => import("./pages/About"));
const Contact = React.lazy(() => import("./pages/Contact"));
const Cart = React.lazy(() => import("./pages/Cart"));
const Wishlist = React.lazy(() => import("./pages/Wishlist"));
const OrderSuccess = React.lazy(() => import("./pages/OrderSuccess"));
const Journal = React.lazy(() => import("./pages/Journal"));
const TrackOrder = React.lazy(() => import("./pages/TrackOrder"));
const Blog = React.lazy(() => import("./pages/Blog"));
const BlogPost = React.lazy(() => import("./pages/BlogPost"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const TermsConditions = React.lazy(() => import("./pages/TermsConditions"));
const ShippingPolicy = React.lazy(() => import("./pages/ShippingPolicy"));
const ReturnPolicy = React.lazy(() => import("./pages/ReturnPolicy"));
const CancellationPolicy = React.lazy(() => import("./pages/CancellationPolicy"));
const CookiePolicy = React.lazy(() => import("./pages/CookiePolicy"));
const Disclaimer = React.lazy(() => import("./pages/Disclaimer"));
const FAQ = React.lazy(() => import("./pages/FAQ"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const Checkout = React.lazy(() => import("./pages/Checkout"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const MyOrders = React.lazy(() => import("./pages/MyOrders"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Compare = React.lazy(() => import("./pages/Compare"));
const SharedWishlist = React.lazy(() => import("./pages/SharedWishlist"));

/* ADMIN PAGES */
const AdminLogin = React.lazy(() => import("./pages/admin/Login"));
const AdminDashboard = React.lazy(() => import("./pages/admin/Dashboard"));
const AdminProducts = React.lazy(() => import("./pages/admin/Products"));
const AdminOrders = React.lazy(() => import("./pages/admin/Orders"));
const AdminUsers = React.lazy(() => import("./pages/admin/Users"));
const AdminCoupons = React.lazy(() => import("./pages/admin/Coupons"));
const AdminReviews = React.lazy(() => import("./pages/admin/Reviews"));
const AdminBanners = React.lazy(() => import("./pages/admin/Banners"));
const AdminCombos = React.lazy(() => import("./pages/admin/Combos"));
const AdminSettings = React.lazy(() => import("./pages/admin/Settings"));
const AdminBlogs = React.lazy(() => import("./pages/admin/Blogs"));
const AdminDeals = React.lazy(() => import("./pages/admin/Deals"));
const AdminNewsletter = React.lazy(() => import("./pages/admin/Newsletter"));
const AdminContacts = React.lazy(() => import("./pages/admin/Contacts"));
const AdminTestimonials = React.lazy(() => import("./pages/admin/Testimonials"));
const AdminFAQ = React.lazy(() => import("./pages/admin/AdminFAQ"));
const AdminGoals = React.lazy(() => import("./pages/admin/Goals"));
const AdminOurStory = React.lazy(() => import("./pages/admin/OurStory"));

const spinner = <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full" /></div>;

function ProtectedAdminRoute({ children }) {
  const { userInfo } = useContext(AuthContext);
  if (!userInfo) return <Navigate to="/admin" replace />;
  if (!userInfo.isAdmin) return <Navigate to="/" replace />;
  return <AdminContextProvider>{children}</AdminContextProvider>;
}

function App() {
  const location = useLocation();

  useAutoRefresh();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isAdminRoute = location.pathname.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
      <div className="min-h-screen bg-zinc-50">
        <Suspense fallback={spinner}>
          <Routes location={location}>
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
            <Route path="/admin/products" element={<ProtectedAdminRoute><AdminProducts /></ProtectedAdminRoute>} />
            <Route path="/admin/orders" element={<ProtectedAdminRoute><AdminOrders /></ProtectedAdminRoute>} />
            <Route path="/admin/users" element={<ProtectedAdminRoute><AdminUsers /></ProtectedAdminRoute>} />
            <Route path="/admin/coupons" element={<ProtectedAdminRoute><AdminCoupons /></ProtectedAdminRoute>} />
            <Route path="/admin/reviews" element={<ProtectedAdminRoute><AdminReviews /></ProtectedAdminRoute>} />
            <Route path="/admin/banners" element={<ProtectedAdminRoute><AdminBanners /></ProtectedAdminRoute>} />
            <Route path="/admin/combos" element={<ProtectedAdminRoute><AdminCombos /></ProtectedAdminRoute>} />
            <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>} />
            <Route path="/admin/blogs" element={<ProtectedAdminRoute><AdminBlogs /></ProtectedAdminRoute>} />
            <Route path="/admin/deals" element={<ProtectedAdminRoute><AdminDeals /></ProtectedAdminRoute>} />
            <Route path="/admin/newsletter" element={<ProtectedAdminRoute><AdminNewsletter /></ProtectedAdminRoute>} />
            <Route path="/admin/contacts" element={<ProtectedAdminRoute><AdminContacts /></ProtectedAdminRoute>} />
            <Route path="/admin/testimonials" element={<ProtectedAdminRoute><AdminTestimonials /></ProtectedAdminRoute>} />
            <Route path="/admin/faqs" element={<ProtectedAdminRoute><AdminFAQ /></ProtectedAdminRoute>} />
            <Route path="/admin/goals" element={<ProtectedAdminRoute><AdminGoals /></ProtectedAdminRoute>} />
            <Route path="/admin/our-story" element={<ProtectedAdminRoute><AdminOurStory /></ProtectedAdminRoute>} />
          </Routes>
        </Suspense>
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />
      </div>
      <CookieConsent />
      </GoogleOAuthProvider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-white overflow-x-hidden">
      <Analytics />
      <AnnouncementBar />
      <Navbar />
      <PremiumBenefitsBar />

      <Suspense fallback={spinner}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<FadeIn><Products /></FadeIn>} />
          <Route path="/products/category/:category" element={<FadeIn><CategoryProducts /></FadeIn>} />
          <Route path="/products/:id" element={<FadeIn><ProductDetails /></FadeIn>} />
          <Route path="/search" element={<FadeIn><Search /></FadeIn>} />
          <Route path="/about" element={<FadeIn><About /></FadeIn>} />
          <Route path="/contact" element={<FadeIn><Contact /></FadeIn>} />
          <Route path="/blog" element={<FadeIn><Blog /></FadeIn>} />
          <Route path="/blog/:slug" element={<FadeIn><BlogPost /></FadeIn>} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/my-orders" element={<FadeIn><MyOrders /></FadeIn>} />
          <Route path="/cart" element={<FadeIn><Cart /></FadeIn>} />
          <Route path="/Wishlist" element={<FadeIn><Wishlist /></FadeIn>} />
          <Route path="/login" element={<FadeIn><Login /></FadeIn>} />
          <Route path="/register" element={<FadeIn><Register /></FadeIn>} />
          <Route path="/forgot-password" element={<FadeIn><ForgotPassword /></FadeIn>} />
          <Route path="/reset-password/:token" element={<FadeIn><ResetPassword /></FadeIn>} />
          <Route path="/dashboard" element={<FadeIn><Dashboard /></FadeIn>} />
          <Route path="/checkout" element={<FadeIn><Checkout /></FadeIn>} />
          <Route path="/order-success" element={<FadeIn><OrderSuccess /></FadeIn>} />
          <Route path="/journal" element={<FadeIn><Journal /></FadeIn>} />
          <Route path="/privacy" element={<FadeIn><PrivacyPolicy /></FadeIn>} />
          <Route path="/terms" element={<FadeIn><TermsConditions /></FadeIn>} />
          <Route path="/shipping-policy" element={<FadeIn><ShippingPolicy /></FadeIn>} />
          <Route path="/returns" element={<FadeIn><ReturnPolicy /></FadeIn>} />
          <Route path="/cancellation" element={<FadeIn><CancellationPolicy /></FadeIn>} />
          <Route path="/cookie-policy" element={<FadeIn><CookiePolicy /></FadeIn>} />
          <Route path="/disclaimer" element={<FadeIn><Disclaimer /></FadeIn>} />
          <Route path="/faq" element={<FadeIn><FAQ /></FadeIn>} />
          <Route path="/compare" element={<FadeIn><Compare /></FadeIn>} />
          <Route path="/wishlist/shared/:userId" element={<FadeIn><SharedWishlist /></FadeIn>} />
          <Route path="*" element={<FadeIn><NotFound /></FadeIn>} />
        </Routes>
      </Suspense>

      <WhatsAppButton />
      <BackToTop />
      <Footer />

      <ToastContainer position="top-right" autoClose={2000} theme="colored" />
    </div>
    <CookieConsent />
    </GoogleOAuthProvider>
  );
}

function FadeIn({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default App;