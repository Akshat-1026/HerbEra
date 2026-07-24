import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { getCombos, getAllCombos, createCombo, updateCombo, deleteCombo } from "../controllers/comboController.js";

const router = express.Router();

router.get("/", getCombos);
router.get("/all", protect, admin, getAllCombos);
router.post("/", protect, admin, createCombo);
router.put("/:id", protect, admin, updateCombo);
router.delete("/:id", protect, admin, deleteCombo);

export default router;
