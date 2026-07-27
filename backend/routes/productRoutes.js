import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
} from "../controllers/productController.js";

import { protect, admin } from "../middleware/authMiddleware.js";
import { validate, createProductSchema, updateProductSchema } from "../middleware/validate.js";
import { detectLanguage } from "../middleware/detectLanguage.js";

const router = express.Router();

/* ==========================================================================
   PUBLIC ROUTES (Accessible by any store customer)
   ========================================================================== */

// @route   GET /api/products
// @desc    Fetch and display all available herbal items
router.get("/", detectLanguage, getProducts);

// @route   GET /api/products/search
// 🔥 Placed ABOVE /:id so Express doesn't mistake "search" for an ID
router.get("/search", detectLanguage, searchProducts);

// @route   GET /api/products/:id
// @desc    Fetch details for a single item by its database ID
router.get("/:id", detectLanguage, getProductById);


/* ==========================================================================
   ADMIN ROUTES (Protected by auth middleware)
   ========================================================================== */

// @route   POST /api/products
// @desc    Add a brand new herbal product to the store catalog
router.post("/", protect, admin, validate(createProductSchema), createProduct);

// @route   PUT /api/products/:id
// @desc    Modify pricing, description, or stock counts for an existing item
router.put("/:id", protect, admin, validate(updateProductSchema), updateProduct);

// @route   DELETE /api/products/:id
// @desc    Remove a product entirely from the store catalog
router.delete("/:id", protect, admin, deleteProduct);

export default router;