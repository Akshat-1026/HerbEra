import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { getSiteContent, upsertSiteContent } from "../controllers/siteContentController.js";

const router = express.Router();

router.get("/:page", getSiteContent);
router.put("/:page", protect, admin, upsertSiteContent);

export default router;
