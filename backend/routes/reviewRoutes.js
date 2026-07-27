import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { validate, createReviewSchema } from "../middleware/validate.js";
import {
  getReviews,
  getProductReviews,
  getReviewStats,
  createReview,
  updateReview,
  toggleHelpful,
  reportReview,
  toggleApproval,
  deleteReview,
} from "../controllers/reviewController.js";

const router = express.Router();

router.get("/", protect, admin, getReviews);
router.get("/product/:productId/stats", getReviewStats);
router.get("/product/:productId", getProductReviews);
router.post("/product/:productId", protect, validate(createReviewSchema), createReview);
router.put("/:id", protect, updateReview);
router.post("/:id/helpful", protect, toggleHelpful);
router.post("/:id/report", protect, reportReview);
router.put("/:id/approve", protect, admin, toggleApproval);
router.delete("/:id", protect, admin, deleteReview);

export default router;
