import express from "express";
import { protect, admin, optionalAuth } from "../middleware/authMiddleware.js";
import {
  createPaymentOrder,
  verifyPayment,
  retryPayment,
  getPaymentStatus,
  refundPayment,
  createCustomer,
  createPaymentLink,
  getRazorpayOrders,
  razorpayWebhook,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/webhook", express.raw({ type: "application/json" }), razorpayWebhook);
router.post("/create-order", optionalAuth, createPaymentOrder);
router.post("/verify", optionalAuth, verifyPayment);
router.post("/retry", optionalAuth, retryPayment);
router.post("/customer", protect, createCustomer);
router.post("/payment-link", protect, createPaymentLink);
router.get("/status/:orderId", protect, getPaymentStatus);
router.get("/razorpay-orders", protect, admin, getRazorpayOrders);
router.post("/refund/:orderId", protect, admin, refundPayment);

export default router;
