import crypto from "crypto";
import Razorpay from "razorpay";
import Order from "../models/Order.js";
import config from "../config/index.js";
import { broadcast } from "../utils/sseManager.js";

const razorpay = config.razorpayKeyId
  ? new Razorpay({
      key_id: config.razorpayKeyId,
      key_secret: config.razorpayKeySecret,
    })
  : null;

export const createPaymentOrder = async (req, res) => {
  try {
    const { orderId, currency = "INR" } = req.body;
    if (!razorpay) {
      return res.status(400).json({ message: "Payment gateway not configured" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.isPaid) {
      return res.status(400).json({ message: "Order is already paid" });
    }

    if (order.user) {
      if (!req.user || (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin)) {
        return res.status(403).json({ message: "Not authorized to pay for this order" });
      }
    }

    const options = {
      amount: Math.round(order.totalPrice * 100),
      currency,
      receipt: `order_${order._id}`,
    };
    const razorpayOrder = await razorpay.orders.create(options);
    res.json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: config.razorpayKeyId,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    if (!razorpay) {
      return res.status(400).json({ message: "Payment gateway not configured" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", config.razorpayKeySecret)
      .update(body)
      .digest("hex");

    if (!razorpay_signature || razorpay_signature.length !== expectedSignature.length) {
      return res.status(400).json({ message: "Payment verification failed" });
    }
    if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature))) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user) {
      if (!req.user || (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin)) {
        return res.status(403).json({ message: "Not authorized to pay for this order" });
      }
    }

    if (order.isPaid) {
      return res.status(400).json({ message: "Order is already paid" });
    }

    const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
    if (Number(razorpayOrder.amount) !== Math.round(order.totalPrice * 100)) {
      return res.status(400).json({ message: "Payment amount mismatch" });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: razorpay_payment_id,
      orderId: razorpay_order_id,
      signature: razorpay_signature,
    };
    const updatedOrder = await order.save();

    broadcast("site-update", { type: "payment", action: "verified" });
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac("sha256", config.razorpayKeySecret)
      .update(body)
      .digest("hex");

    if (!signature || signature.length !== expectedSignature.length) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }
    if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = req.body;

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const orderId = payment.receipt?.replace("order_", "");

      if (orderId) {
        const order = await Order.findById(orderId);
        if (order && !order.isPaid) {
          order.isPaid = true;
          order.paidAt = new Date(payment.created_at * 1000);
          order.paymentResult = {
            id: payment.id,
            orderId: payment.order_id,
            signature: signature,
          };
          await order.save();
          broadcast("site-update", { type: "payment", action: "verified" });
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
