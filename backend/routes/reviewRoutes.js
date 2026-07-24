import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { validate, createReviewSchema } from "../middleware/validate.js";
import { getReviews, getProductReviews, createReview, deleteReview } from "../controllers/reviewController.js";

const router = express.Router();

router.get("/", protect, admin, getReviews);
router.get("/product/:productId", getProductReviews);
router.post("/product/:productId", protect, validate(createReviewSchema), createReview);
router.delete("/:id", protect, admin, deleteReview);

export default router;
