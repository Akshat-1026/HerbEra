import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  addToCart,
  getCart,
  removeFromCart,
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/", protect, getCart);

router.post("/", protect, addToCart);

router.delete("/:id", protect, removeFromCart);

export default router;