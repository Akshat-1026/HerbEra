import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { validate, createFaqSchema } from "../middleware/validate.js";
import {
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} from "../controllers/faqController.js";

const router = express.Router();

router.get("/", (req, res, next) => {
  if (req.query.all === "true") {
    return protect(req, res, () => admin(req, res, next));
  }
  getFAQs(req, res, next);
});
router.post("/", protect, admin, validate(createFaqSchema), createFAQ);
router.put("/:id", protect, admin, updateFAQ);
router.delete("/:id", protect, admin, deleteFAQ);

export default router;
