import express from "express";
import {
  getBlogs,
  getBlogBySlug,
  getBlogCategories,
  createBlog,
  updateBlog,
  deleteBlog,
  addComment,
  getAllBlogsAdmin,
} from "../controllers/blogController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { validate, createBlogSchema } from "../middleware/validate.js";
import { commentLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.get("/categories/list", getBlogCategories);
router.get("/", getBlogs);
router.get("/admin/all", protect, admin, getAllBlogsAdmin);
router.get("/:slug", getBlogBySlug);

router.post("/:slug/comments", protect, commentLimiter, addComment);

router.post("/", protect, admin, validate(createBlogSchema), createBlog);
router.put("/:id", protect, admin, updateBlog);
router.delete("/:id", protect, admin, deleteBlog);

export default router;
