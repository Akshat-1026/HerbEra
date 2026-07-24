import express from "express";
import { subscribe, unsubscribe, getAll } from "../controllers/newsletterController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { contactLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/subscribe", contactLimiter, subscribe);
router.post("/unsubscribe", contactLimiter, unsubscribe);
router.get("/", protect, admin, getAll);

export default router;
