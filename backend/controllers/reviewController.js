import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { broadcast } from "../utils/sseManager.js";
import { sanitizeString } from "../utils/sanitize.js";

const updateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId, isApproved: true } },
    { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const avg = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;
  const count = stats.length > 0 ? stats[0].count : 0;
  await Product.findByIdAndUpdate(productId, { rating: avg, numReviews: count });
};

/* ================= GET REVIEWS (ADMIN) ================= */

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

/* ================= GET PRODUCT REVIEWS (PUBLIC) ================= */

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { product: productId, isApproved: true };

    if (req.query.rating) {
      const r = parseInt(req.query.rating);
      if (r >= 1 && r <= 5) filter.rating = r;
    }

    let sort = { createdAt: -1 };
    if (req.query.sort === "highest") sort = { rating: -1, createdAt: -1 };
    else if (req.query.sort === "lowest") sort = { rating: 1, createdAt: -1 };
    else if (req.query.sort === "helpful") sort = { helpfulCount: -1, createdAt: -1 };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("user", "name")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter),
    ]);

    res.json({
      reviews,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= GET REVIEW STATS (PUBLIC) ================= */

export const getReviewStats = async (req, res) => {
  try {
    const { productId } = req.params;

    const [dist, totals] = await Promise.all([
      Review.aggregate([
        { $match: { product: await Product.findById(productId)?._id, isApproved: true } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
      ]),
      Review.aggregate([
        { $match: { product: await Product.findById(productId)?._id, isApproved: true } },
        { $group: { _id: null, avg: { $avg: "$rating" }, total: { $sum: 1 } } },
      ]),
    ]);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    dist.forEach((d) => { distribution[d._id] = d.count; });

    res.json({
      average: totals.length > 0 ? Math.round(totals[0].avg * 10) / 10 : 0,
      total: totals.length > 0 ? totals[0].total : 0,
      distribution,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= CREATE REVIEW ================= */

export const createReview = async (req, res) => {
  try {
    const { rating, comment, images } = req.body;
    const productId = req.params.productId;

    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const sanitizedComment = typeof comment === "string" ? sanitizeString(comment.trim()) : comment;

    const sanitizedImages = Array.isArray(images)
      ? images.slice(0, 5).map((img) => String(img))
      : [];

    const hasPurchased = await Order.exists({
      user: req.user._id,
      "orderItems.product": productId,
      isPaid: true,
    });

    const existing = await Review.findOne({ user: req.user._id, product: productId });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this product. Use PUT to update." });
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      comment: sanitizedComment,
      images: sanitizedImages,
      isVerifiedPurchase: !!hasPurchased,
    });

    await updateProductRating(productId);

    const populated = await Review.findById(review._id).populate("user", "name");
    broadcast("site-update", { type: "review", action: "created" });
    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already reviewed this product. Use PUT to update." });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= UPDATE REVIEW ================= */

export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to edit this review" });
    }

    const { rating, comment, images } = req.body;

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = sanitizeString(String(comment).trim());
    if (images !== undefined) review.images = Array.isArray(images) ? images.slice(0, 5).map(String) : [];

    await review.save();
    await updateProductRating(review.product);

    const populated = await Review.findById(review._id).populate("user", "name");
    broadcast("site-update", { type: "review", action: "updated" });
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= TOGGLE HELPFUL ================= */

export const toggleHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const userId = req.user._id;
    const idx = review.helpfulBy.findIndex((id) => id.toString() === userId.toString());

    if (idx > -1) {
      review.helpfulBy.splice(idx, 1);
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      review.helpfulBy.push(userId);
      review.helpfulCount += 1;
    }

    await review.save();
    res.json({ helpfulCount: review.helpfulCount, isHelpful: idx === -1 });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= REPORT REVIEW ================= */

export const reportReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.isReported) {
      return res.status(400).json({ message: "Review already reported" });
    }

    review.isReported = true;
    review.reportReason = sanitizeString(String(req.body.reason || "Inappropriate").trim());
    await review.save();

    res.json({ message: "Review reported" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= APPROVE/REJECT (ADMIN) ================= */

export const toggleApproval = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    review.isApproved = !review.isApproved;
    await review.save();
    await updateProductRating(review.product);

    broadcast("site-update", { type: "review", action: review.isApproved ? "approved" : "rejected" });
    res.json({ message: review.isApproved ? "Review approved" : "Review rejected", isApproved: review.isApproved });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= DELETE REVIEW ================= */

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
