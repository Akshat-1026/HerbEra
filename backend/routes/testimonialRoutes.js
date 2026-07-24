import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "../controllers/testimonialController.js";

const router = express.Router();

router.get("/", (req, res, next) => {
  if (req.query.all === "true") {
    return protect(req, res, () => admin(req, res, next));
  }
  getTestimonials(req, res, next);
});
router.post("/", protect, admin, createTestimonial);
router.put("/:id", protect, admin, updateTestimonial);
router.delete("/:id", protect, admin, deleteTestimonial);

export default router;
