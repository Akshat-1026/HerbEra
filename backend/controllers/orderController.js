import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import User from "../models/User.js";
import config from "../config/index.js";
import { sendOrderConfirmation, sendStatusUpdate, sendAdminOrderNotification } from "../utils/emailService.js";
import { generateInvoicePDF } from "../utils/generateInvoice.js";
import { broadcast } from "../utils/sseManager.js";
import { sanitizeString } from "../utils/sanitize.js";

const generateInvoiceNumber = (count) => {
  const date = new Date();
  const ym = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
  return `HE-${ym}-${String(count + 1).padStart(4, "0")}`;
};

/* ================= CREATE ORDER ================= */

export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      couponCode: clientCouponCode,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    // --- 1. Verify product prices server-side ---
    const productIds = orderItems.map((item) => item.product || item._id);
    const dbProducts = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

    let subtotal = 0;
    const mappedItems = orderItems.map((item) => {
      const dbProduct = productMap.get((item.product || item._id).toString());
      if (!dbProduct) {
        throw new Error(`Product not found: ${item.name}`);
      }

      let unitPrice;
      if (item.selectedVariant?.label && dbProduct.variants?.length) {
        const variant = dbProduct.variants.find((v) => v.label === item.selectedVariant.label);
        if (!variant) throw new Error(`Variant "${item.selectedVariant.label}" not found for ${item.name}`);
        unitPrice = variant.price;
      } else {
        unitPrice = dbProduct.price;
      }

      const lineTotal = unitPrice * item.qty;
      subtotal += lineTotal;

      return {
        name: dbProduct.name,
        qty: item.qty,
        image: item.image || dbProduct.image,
        price: unitPrice,
        product: dbProduct._id,
        sku: dbProduct.sku || "",
        variantLabel: item.selectedVariant?.label || undefined,
        hsnCode: dbProduct.hsnCode || "1211",
      };
    });

    // --- 2. Validate & apply coupon ---
    let discountAmount = 0;
    let couponDoc = null;
    if (clientCouponCode) {
      couponDoc = await Coupon.findOne({ code: clientCouponCode.toUpperCase() });
      if (couponDoc && couponDoc.isActive && new Date(couponDoc.expiry) >= new Date()) {
        discountAmount = Math.round(subtotal * (couponDoc.discount / 100));
      }
    }

    const afterDiscount = subtotal - discountAmount;

    // --- 3. Calculate shipping ---
    const shippingPrice = afterDiscount >= config.shippingFreeAbove ? 0 : config.shippingCharged;

    // --- 4. Calculate GST ---
    const gstRate = config.gstRate;
    const gstAmount = Math.round(afterDiscount * (gstRate / 100));
    const halfGst = Math.round(gstAmount / 2);

    // Intra-state: CGST + SGST | Inter-state: IGST
    const isSameState = shippingAddress.state === config.businessState;
    const gstBreakdown = isSameState
      ? { cgst: halfGst, sgst: gstAmount - halfGst, igst: 0 }
      : { cgst: 0, sgst: 0, igst: gstAmount };

    const totalPrice = afterDiscount + shippingPrice + gstAmount;

    // --- 5. Generate invoice number ---
    const orderCount = await Order.countDocuments();
    const invoiceNumber = generateInvoiceNumber(orderCount);

    const trackingNumber = "HERB-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

    const orderData = {
      orderItems: mappedItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      discountAmount,
      couponCode: couponDoc ? couponDoc.code : undefined,
      shippingPrice,
      gstRate,
      gstAmount,
      gstBreakdown,
      totalPrice,
      invoiceNumber,
      trackingNumber,
      timeline: [{ status: "pending", date: new Date(), note: "Order placed" }],
    };

    orderData.user = req.user._id;

    const order = new Order(orderData);
    const createdOrder = await order.save();

    try {
      await sendOrderConfirmation(createdOrder, req.user);
    } catch (emailErr) {
      console.error("Failed to send order confirmation email:", emailErr.message);
    }

    try {
      const customerName = req.user.name || req.user.email;
      await sendAdminOrderNotification(createdOrder, customerName);
    } catch (emailErr) {
      console.error("Failed to send admin order notification:", emailErr.message);
    }

    broadcast("site-update", { type: "order", action: "created" });
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= GET USER ORDERS ================= */

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

/* ================= GET ALL ORDERS (ADMIN) ================= */

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

/* ================= GET ORDER BY ID ================= */

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(
      req.params.id
    ).populate("user", "name email");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (!order.user) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }
    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

/* ================= CANCEL ORDER ================= */

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }

    const hoursSinceCreation =
      (Date.now() - new Date(order.createdAt).getTime()) / 3600000;

    if (hoursSinceCreation > 24) {
      return res.status(400).json({
        message: "Order can only be cancelled within 24 hours",
      });
    }

    if (
      order.status === "delivered" ||
      order.status === "cancelled"
    ) {
      return res.status(400).json({
        message: "Order cannot be cancelled",
      });
    }

    order.status = "cancelled";

    order.timeline.push({
      status: "cancelled",
      note: req.body.reason ? sanitizeString(String(req.body.reason).trim()) : "Cancelled by user",
    });

    const updatedOrder = await order.save();

    try {
      if (order.user) {
        const user = await User.findById(order.user);
        if (user) await sendStatusUpdate(updatedOrder, user);
      } else if (order.guestEmail) {
        await sendStatusUpdate(updatedOrder, { name: order.guestName || "Guest", email: order.guestEmail });
      }
    } catch (emailErr) {
      console.error("Failed to send cancellation email:", emailErr.message);
    }

    broadcast("site-update", { type: "order", action: "cancelled" });
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

/* ================= GET ORDER BY TRACKING ================= */

export const getOrderByTracking = async (req, res) => {
  try {
    const order = await Order.findOne({
      trackingNumber: req.params.trackingNumber,
    }).select("-__v");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

/* ================= MARK DELIVERED ================= */

export const markOrderDelivered = async (
  req,
  res
) => {
  try {
    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder =
      await order.save();

    try {
      if (order.user) {
        const user = await User.findById(order.user);
        if (user) await sendStatusUpdate(updatedOrder, user);
      } else if (order.guestEmail) {
        await sendStatusUpdate(updatedOrder, { name: order.guestName || "Guest", email: order.guestEmail });
      }
    } catch (emailErr) {
      console.error("Failed to send delivery email:", emailErr.message);
    }

    broadcast("site-update", { type: "order", action: "delivered" });
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

/* ================= MARK AS PAID (ADMIN) ================= */

export const markAsPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.isPaid) {
      return res.status(400).json({ message: "Order is already marked as paid" });
    }

    const { paymentMethod, note } = req.body;
    const method = paymentMethod || order.paymentMethod || "Manual";

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: "ADMIN-" + Date.now(),
      orderId: `MANUAL-${method.toUpperCase()}`,
      signature: note || `Marked paid by admin via ${method}`,
    };

    const updatedOrder = await order.save();

    try {
      if (order.user) {
        const user = await User.findById(order.user);
        if (user) await sendStatusUpdate(updatedOrder, user);
      } else if (order.guestEmail) {
        await sendStatusUpdate(updatedOrder, { name: order.guestName || "Guest", email: order.guestEmail });
      }
    } catch (emailErr) {
      console.error("Failed to send order confirmation email:", emailErr.message);
    }

    broadcast("site-update", { type: "order", action: "paid" });
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= UPDATE ORDER STATUS ================= */

const validTransitions = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = Object.keys(validTransitions);
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const currentStatus = order.status || "pending";
    const allowed = validTransitions[currentStatus];
    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({
        message: `Cannot transition from "${currentStatus}" to "${status}". Allowed: ${(allowed || []).join(", ") || "none"}`,
      });
    }

    order.status = status;
    order.timeline.push({
      status,
      date: new Date(),
      note: note || `Order ${status}`,
    });

    if (status === "delivered") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    try {
      if (order.user) {
        const user = await User.findById(order.user);
        if (user) await sendStatusUpdate(updatedOrder, user);
      } else if (order.guestEmail) {
        await sendStatusUpdate(updatedOrder, { name: order.guestName || "Guest", email: order.guestEmail });
      }
    } catch (emailErr) {
      console.error("Failed to send order confirmation email:", emailErr.message);
    }

    broadcast("site-update", { type: "order", action: "status-updated" });
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= DELETE ORDER ================= */

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    await order.deleteOne();
    broadcast("site-update", { type: "order", action: "deleted" });
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= DOWNLOAD INVOICE ================= */

export const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!order.user) {
      return res.status(403).json({ message: "Not authorized to download this invoice" });
    }
    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to download this invoice" });
    }

    const pdfBuffer = await generateInvoicePDF(order);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${order.invoiceNumber || order.trackingNumber}.pdf"`,
      "Content-Length": pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};