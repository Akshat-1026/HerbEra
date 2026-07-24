import express from "express";
import { optionalAuth, protect } from "../middleware/authMiddleware.js";
import { createPaymentOrder, verifyPayment, razorpayWebhook } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/webhook", express.raw({ type: "application/json" }), razorpayWebhook);
router.post("/create-order", optionalAuth, createPaymentOrder);
router.post("/verify", optionalAuth, verifyPayment);

export default router;
