import Review from "../models/Review.js";
import Product from "../models/Product.js";
import { broadcast } from "../utils/sseManager.js";
import { sanitizeString } from "../utils/sanitize.js";

const updateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const avg = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;
  const count = stats.length > 0 ? stats[0].count : 0;
  await Product.findByIdAndUpdate(productId, { rating: avg, numReviews: count });
};

export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("product", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.productId;

    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required" });
    }

    const existing = await Review.findOne({ user: req.user._id, product: productId });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      comment: typeof comment === "string" ? sanitizeString(comment.trim()) : comment,
    });

    await updateProductRating(productId);

    const populated = await Review.findById(review._id).populate("user", "name");

    broadcast("site-update", { type: "review", action: "created" });
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const productId = review.product;
    await review.deleteOne();
    await updateProductRating(productId);

    broadcast("site-update", { type: "review", action: "deleted" });
    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
