import crypto from "crypto";
import Razorpay from "razorpay";
import Order from "../models/Order.js";
import config from "../config/index.js";
import { broadcast } from "../utils/sseManager.js";
import { sanitizeString } from "../utils/sanitize.js";

const razorpay = config.razorpayKeyId
  ? new Razorpay({
      key_id: config.razorpayKeyId,
      key_secret: config.razorpayKeySecret,
    })
  : null;

/* ================= CREATE PAYMENT ORDER ================= */

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
      notes: {
        orderId: order._id.toString(),
        trackingNumber: order.trackingNumber || "",
      },
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

/* ================= VERIFY PAYMENT ================= */

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

/* ================= RETRY PAYMENT ================= */

export const retryPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
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

    if (order.paymentMethod !== "Razorpay") {
      return res.status(400).json({ message: "Only Razorpay orders can be retried" });
    }

    if (order.user) {
      if (!req.user || (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin)) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    const options = {
      amount: Math.round(order.totalPrice * 100),
      currency: "INR",
      receipt: `order_${order._id}`,
      notes: {
        orderId: order._id.toString(),
        trackingNumber: order.trackingNumber || "",
        retry: "true",
      },
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

/* ================= FETCH PAYMENT STATUS ================= */

export const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!razorpay) {
      return res.status(400).json({ message: "Payment gateway not configured" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user) {
      if (!req.user || (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin)) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    if (!order.paymentResult?.orderId) {
      return res.json({
        isPaid: order.isPaid,
        status: order.isPaid ? "paid" : "unpaid",
        paymentMethod: order.paymentMethod,
      });
    }

    const razorpayOrder = await razorpay.orders.fetch(order.paymentResult.orderId);
    const payments = await razorpay.orders.fetchPayments(order.paymentResult.orderId);

    const paymentDetails = payments.items.map((p) => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      method: p.method,
      captured: p.captured,
      createdAt: new Date(p.created_at * 1000),
    }));

    res.json({
      isPaid: order.isPaid,
      status: razorpayOrder.status,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      payments: paymentDetails,
      refundStatus: order.refundStatus,
      refundAmount: order.refundAmount,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= REFUND PAYMENT (ADMIN) ================= */

export const refundPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { amount, reason } = req.body;

    if (!razorpay) {
      return res.status(400).json({ message: "Payment gateway not configured" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!order.isPaid) {
      return res.status(400).json({ message: "Cannot refund an unpaid order" });
    }

    if (order.paymentMethod !== "Razorpay" || !order.paymentResult?.id) {
      return res.status(400).json({ message: "Only Razorpay payments can be refunded automatically" });
    }

    const maxRefundable = order.totalPrice - (order.refundAmount || 0);
    if (maxRefundable <= 0) {
      return res.status(400).json({ message: "Order has already been fully refunded" });
    }

    const refundAmount = amount ? Math.min(Number(amount), maxRefundable) : maxRefundable;
    const refundAmountPaise = Math.round(refundAmount * 100);

    order.refundStatus = "processing";
    await order.save();

    const refund = await razorpay.payments.refund(order.paymentResult.id, {
      amount: refundAmountPaise,
      notes: {
        orderId: order._id.toString(),
        reason: sanitizeString(reason || "Admin refund"),
      },
    });

    const isFullRefund = refundAmount >= order.totalPrice;
    order.refundStatus = isFullRefund ? "completed" : "completed";
    order.refundId = refund.id;
    order.refundAmount = (order.refundAmount || 0) + refundAmount;
    order.refundReason = sanitizeString(reason || "Admin refund");
    order.refundedAt = Date.now();
    order.refundHistory.push({
      refundId: refund.id,
      amount: refundAmount,
      reason: sanitizeString(reason || "Admin refund"),
      status: refund.status,
    });

    if (isFullRefund) {
      order.status = "cancelled";
      order.timeline.push({
        status: "cancelled",
        note: `Full refund of ₹${refundAmount} processed`,
      });
    }

    const updatedOrder = await order.save();

    broadcast("site-update", { type: "payment", action: "refunded" });
    res.json({
      message: `Refund of ₹${refundAmount} processed successfully`,
      refund: {
        id: refund.id,
        amount: refundAmount,
        status: refund.status,
      },
      order: updatedOrder,
    });
  } catch (error) {
    const order = await Order.findById(req.params.orderId);
    if (order) {
      order.refundStatus = "failed";
      await order.save();
    }
    res.status(500).json({ message: "Refund failed: " + (error.message || "Internal server error") });
  }
};

/* ================= CREATE CUSTOMER ================= */

export const createCustomer = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!razorpay) {
      return res.status(400).json({ message: "Payment gateway not configured" });
    }

    const customer = await razorpay.customers.create({
      name,
      email,
      phone,
    });

    res.json({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= CREATE PAYMENT LINK ================= */

export const createPaymentLink = async (req, res) => {
  try {
    const { orderId, amount, description } = req.body;
    if (!razorpay) {
      return res.status(400).json({ message: "Payment gateway not configured" });
    }

    let orderDetails = {};
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (order.user) {
        if (!req.user || (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin)) {
          return res.status(403).json({ message: "Not authorized" });
        }
      }
      orderDetails = {
        amount: Math.round(order.totalPrice * 100),
        description: `Payment for Order #${order.trackingNumber}`,
      };
    }

    const finalAmount = orderId ? orderDetails.amount : Math.round(Number(amount) * 100);
    const finalDescription = orderId ? orderDetails.description : (description || "Payment for Herb-Era order");

    const paymentLink = await razorpay.paymentLink.create({
      amount: finalAmount,
      currency: "INR",
      description: finalDescription,
      notes: orderId ? { orderId } : {},
      callback_url: `${config.frontendUrl}/track-order`,
      callback_method: "get",
    });

    res.json({
      id: paymentLink.id,
      short_url: paymentLink.short_url,
      amount: finalAmount,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= FETCH ALL ORDERS FROM RAZORPAY (ADMIN) ================= */

export const getRazorpayOrders = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(400).json({ message: "Payment gateway not configured" });
    }

    const { from, to, count = 10 } = req.query;
    const options = {
      count: Math.min(Number(count), 100),
    };
    if (from) options.from = Math.floor(new Date(from).getTime() / 1000);
    if (to) options.to = Math.floor(new Date(to).getTime() / 1000);

    const orders = await razorpay.orders.all(options);
    res.json({
      count: orders.count,
      items: orders.items.map((o) => ({
        id: o.id,
        amount: o.amount,
        currency: o.currency,
        status: o.status,
        receipt: o.receipt,
        created_at: new Date(o.created_at * 1000),
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= ENHANCED WEBHOOK HANDLER ================= */

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

    switch (event.event) {
      case "payment.captured": {
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
        break;
      }

      case "payment.failed": {
        const payment = event.payload.payment.entity;
        const orderId = payment.receipt?.replace("order_", "");
        if (orderId) {
          const order = await Order.findById(orderId);
          if (order) {
            order.timeline.push({
              status: order.status,
              note: `Payment failed: ${payment.error_description || "Unknown error"}`,
            });
            await order.save();
            broadcast("site-update", { type: "payment", action: "failed" });
          }
        }
        break;
      }

      case "refund.created":
      case "refund.processed": {
        const refund = event.payload.refund.entity;
        const orderId = refund.notes?.orderId;
        if (orderId) {
          const order = await Order.findById(orderId);
          if (order) {
            const refundAmount = refund.amount / 100;
            order.refundStatus = event.event === "refund.processed" ? "completed" : "processing";
            order.refundId = refund.id;
            order.refundAmount = (order.refundAmount || 0) + refundAmount;
            if (event.event === "refund.processed") {
              order.refundedAt = new Date(refund.created_at * 1000);
            }
            await order.save();
            broadcast("site-update", { type: "payment", action: "refunded" });
          }
        }
        break;
      }

      case "refund.failed": {
        const refund = event.payload.refund.entity;
        const orderId = refund.notes?.orderId;
        if (orderId) {
          const order = await Order.findById(orderId);
          if (order) {
            order.refundStatus = "failed";
            await order.save();
          }
        }
        break;
      }

      default:
        break;
    }

    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
