import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Coupon from "../models/Coupon.js";
import Review from "../models/Review.js";

const router = express.Router();

router.get("/dashboard", protect, admin, async (req, res) => {
  try {
    const users = await User.countDocuments();
    const products = await Product.countDocuments();
    const orders = await Order.countDocuments();
    const coupons = await Coupon.countDocuments();
    const reviews = await Review.countDocuments();
    const allOrders = await Order.find();
    const revenue = allOrders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);

    const ordersByMonth = await Order.aggregate([
      { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 }, revenue: { $sum: "$totalPrice" } } },
      { $sort: { _id: 1 } },
    ]);

    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ users, products, orders, coupons, reviews, revenue, ordersByMonth, recentOrders });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
