import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";

import connectDB from "./config/db.js";
import config from "./config/index.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

// Middleware
import { apiLimiter, authLimiter, strictAuthLimiter } from "./middleware/rateLimiter.js";
import { responseCache } from "./middleware/cache.js";

// Routes
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import wishlistRoutes from "./routes/WishlistRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import dealRoutes from "./routes/dealRoutes.js";
import comboRoutes from "./routes/comboRoutes.js";

import blogRoutes from "./routes/blogRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import settingRoutes from "./routes/settingRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import faqRoutes from "./routes/faqRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import { seedDefaultSettings } from "./controllers/settingController.js";
import sitemapRoutes from "./routes/sitemapRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import siteContentRoutes from "./routes/siteContentRoutes.js";
import { addClient } from "./utils/sseManager.js";
import Coupon from "./models/Coupon.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = http.createServer(app);

/* ==========================
   SECURITY & PERFORMANCE
   ========================== */

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression({ level: 6, threshold: 1024, filter: (req, res) => {
  if (req.headers["x-no-compression"]) return false;
  return compression.filter(req, res);
}}));
app.use(mongoSanitize());
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Keep-alive + timeout tuning
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
server.timeout = 30000;

/* ==========================
   CORS
   ========================== */

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (config.nodeEnv !== "production") {
        if (["http://localhost:5173", "http://localhost:3000"].includes(origin)) {
          return callback(null, true);
        }
        return callback(null, false);
      }
      if (origin === config.frontendUrl) return callback(null, true);
      if (origin.endsWith(".vercel.app")) return callback(null, true);
      callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept-Language"],
  })
);

/* ==========================
   RATE LIMITING
   ========================== */

app.use("/api", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", strictAuthLimiter);
app.use("/api/auth/reset-password", strictAuthLimiter);
app.use("/api/auth/google", strictAuthLimiter);

/* ==========================
   ROOT ROUTE
   ========================== */

app.get("/api/health", (req, res) => {
  res.json({
    message: "Herb-Era API Running",
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    pid: process.pid,
  });
});

/* ==========================
   SSE EVENTS (auto-reload)
   ========================== */

app.get("/api/events", apiLimiter, (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.write("event: connected\ndata: {}\n\n");
  addClient(res, req.ip);
});

/* ==========================
   API ROUTES
   ========================== */

// Public read-heavy routes get 60s cache
app.use("/api/products", responseCache(60000), productRoutes);
app.use("/api/goals", responseCache(60000), goalRoutes);
app.use("/api/faqs", responseCache(60000), faqRoutes);
app.use("/api/banners", responseCache(60000), bannerRoutes);
app.use("/api/testimonials", responseCache(60000), testimonialRoutes);
app.use("/api/deals", responseCache(60000), dealRoutes);
app.use("/api/combos", responseCache(60000), comboRoutes);
app.use("/api/blogs", responseCache(60000), blogRoutes);
app.use("/api/settings", responseCache(120000), settingRoutes);
app.use("/api/site-content", responseCache(120000), siteContentRoutes);

// Auth/write routes — no cache
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/test", testRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/", sitemapRoutes);

/* ==========================
   404 HANDLER
   ========================== */

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

/* ==========================
   GLOBAL ERROR HANDLER
   ========================== */

app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err.message);
  res.status(err.statusCode || 500).json({
    message: "Internal server error",
  });
});

/* ==========================
   SERVER START
   ========================== */

const startServer = async () => {
  try {
    await connectDB();

    const adminExists = await User.findOne({ email: config.adminEmail });
    if (!adminExists && config.adminPassword) {
      const hashedPassword = await bcrypt.hash(config.adminPassword, 10);
      await User.create({
        name: "Admin",
        email: config.adminEmail,
        password: hashedPassword,
        isAdmin: true,
      });
      console.log(`✅ Default admin created (${config.adminEmail})`);
    } else if (!adminExists && !config.adminPassword) {
      console.warn("⚠️  No admin user found and ADMIN_PASSWORD not set. Set ADMIN_PASSWORD in .env to create one.");
    }

    await seedDefaultSettings();

    server.listen(config.port, () => {
      console.log(`✅ Server running on port ${config.port} [${config.nodeEnv}] (PID: ${process.pid})`);

      const deactivateExpiredCoupons = async () => {
        try {
          const result = await Coupon.updateMany(
            { isActive: true, expiry: { $lt: new Date() } },
            { $set: { isActive: false } }
          );
          if (result.modifiedCount > 0) {
            console.log(`⏰ Auto-deactivated ${result.modifiedCount} expired coupon(s)`);
          }
        } catch (err) {
          console.error("Coupon expiry scheduler error:", err.message);
        }
      };

      deactivateExpiredCoupons();
      setInterval(deactivateExpiredCoupons, 60 * 60 * 1000);
    });
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
};

startServer();