import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { validate, createGoalSchema } from "../middleware/validate.js";
import { getActiveGoals, getAllGoals, createGoal, updateGoal, deleteGoal } from "../controllers/goalController.js";

const router = express.Router();

router.get("/active", getActiveGoals);
router.get("/", protect, admin, getAllGoals);
router.post("/", protect, admin, validate(createGoalSchema), createGoal);
router.put("/:id", protect, admin, updateGoal);
router.delete("/:id", protect, admin, deleteGoal);

export default router;