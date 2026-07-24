import Product from "../models/Product.js";
import User from "../models/User.js";
import Order from "../models/Order.js";

export const getDashboardStats = async (
  req,
  res
) => {
  try {
    const totalProducts =
      await Product.countDocuments();

    const totalUsers =
      await User.countDocuments();

    const totalOrders =
      await Order.countDocuments();

    const revenueResult = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    const topProducts = await Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          name: { $first: "$orderItems.name" },
          count: { $sum: "$orderItems.qty" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: {
            $gte: new Date(new Date().getFullYear(), 0, 1),
            $lte: new Date(new Date().getFullYear(), 11, 31),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: { $ifNull: ["$status", "pending"] },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      totalProducts,
      totalUsers,
      totalOrders,
      totalRevenue,
      topProducts,
      monthlyRevenue,
      ordersByStatus,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};