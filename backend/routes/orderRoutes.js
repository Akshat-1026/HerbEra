import express from "express";
import { protect, admin, optionalAuth } from "../middleware/authMiddleware.js";
import { validate, createOrderSchema } from "../middleware/validate.js";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  markOrderDelivered,
  markAsPaid,
  updateOrderStatus,
  cancelOrder,
  getOrderByTracking,
  deleteOrder,
  downloadInvoice,
} from "../controllers/orderController.js";

const router = express.Router();

/* =========================
   USER ROUTES
   ========================= */

// @route   POST /api/orders (requires login)
router.post("/", protect, validate(createOrderSchema), createOrder);

// @route   GET /api/orders/myorders
// 🔥 Placed ABOVE /:id so Express doesn't mistake "myorders" for an ID
router.get("/myorders", protect, getMyOrders);


/* =========================
   ADMIN ROUTES
   ========================= */

// @route   GET /api/orders/admin
// 🔥 Placed ABOVE /:id so Express doesn't mistake "admin" for an ID
router.get("/admin", protect, admin, getAllOrders);


/* =========================
   PUBLIC ROUTES
   ========================= */

// @route   GET /api/orders/track/:trackingNumber
// 🔥 Placed ABOVE /:id so Express doesn't mistake "track" for an ID
router.get("/track/:trackingNumber", getOrderByTracking);

/* =========================
   DYNAMIC ID ROUTES (Must be at the bottom)
   ========================= */

// @route   GET /api/orders/:id
router.get("/:id", protect, getOrderById);

// @route   GET /api/orders/:id/invoice
router.get("/:id/invoice", protect, downloadInvoice);

// @route   PUT /api/orders/:id/deliver
router.put("/:id/deliver", protect, admin, markOrderDelivered);

// @route   PUT /api/orders/:id/mark-paid
router.put("/:id/mark-paid", protect, admin, markAsPaid);

// @route   PUT /api/orders/:id/status
router.put("/:id/status", protect, admin, updateOrderStatus);

// @route   PUT /api/orders/:id/cancel
router.put("/:id/cancel", protect, cancelOrder);

// @route   DELETE /api/orders/:id
router.delete("/:id", protect, admin, deleteOrder);

export default router;