import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { getActiveDeals, getDealByType, getAllDealsAdmin, createDeal, updateDeal, deleteDeal } from "../controllers/dealController.js";

const router = express.Router();

router.get("/active", getActiveDeals);
router.get("/type/:type", getDealByType);
router.get("/all", protect, admin, getAllDealsAdmin);
router.post("/", protect, admin, createDeal);
router.put("/:id", protect, admin, updateDeal);
router.delete("/:id", protect, admin, deleteDeal);

export default router;
