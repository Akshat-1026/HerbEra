import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { getSettings, updateSetting } from "../controllers/settingController.js";

const router = express.Router();

router.get("/", getSettings);
router.put("/", protect, admin, updateSetting);

export default router;
