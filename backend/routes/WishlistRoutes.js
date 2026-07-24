import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/WishlistController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getWishlist);
router.get("/shared/:userId", protect, async (req, res) => {
  try {
    const User = (await import("../models/User.js")).default;
    const user = await User.findById(req.params.userId).populate("Wishlist");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (req.user._id.toString() !== req.params.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to view this wishlist" });
    }
    res.json(user.Wishlist);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});
router.post("/", protect, addToWishlist);
router.delete("/:productId", protect, removeFromWishlist);

export default router;
