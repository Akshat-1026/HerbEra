import dotenv from "dotenv";
dotenv.config();

const required = [
  "MONGO_URI",
  "JWT_SECRET",
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || "7d",
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",

  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: parseInt(process.env.SMTP_PORT, 10) || 587,
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpFrom: process.env.SMTP_FROM || "noreply@herb-era.com",

  adminEmail: process.env.ADMIN_EMAIL || "admin@herb-era.com",
  adminPassword: process.env.ADMIN_PASSWORD, // REQUIRED in .env — no fallback

  businessName: process.env.BUSINESS_NAME || "Herb-Era",
  businessAddress: process.env.BUSINESS_ADDRESS || "Herb-Era, India",
  businessState: process.env.BUSINESS_STATE || "Maharashtra",
  gstin: process.env.GSTIN || "27AABCU9603R1ZM",
  gstRate: parseFloat(process.env.GST_RATE) || 5,
  shippingFreeAbove: parseFloat(process.env.SHIPPING_FREE_ABOVE) || 500,
  shippingCharged: parseFloat(process.env.SHIPPING_CHARGED) || 49,
};

export default config;
