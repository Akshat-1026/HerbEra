import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { validate, createCouponSchema } from "../middleware/validate.js";
import { getCoupons, createCoupon, deleteCoupon, validateCoupon } from "../controllers/couponController.js";

const router = express.Router();

router.get("/", protect, admin, getCoupons);
router.post("/", protect, admin, validate(createCouponSchema), createCoupon);

// @route   POST /api/coupons/validate
// 🔥 Placed ABOVE /:id so Express doesn't conflict
router.post("/validate", validateCoupon);

router.delete("/:id", protect, admin, deleteCoupon);

export default router;
