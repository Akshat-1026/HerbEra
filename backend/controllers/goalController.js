import Goal from "../models/Goal.js";
import { broadcast } from "../utils/sseManager.js";

const GOAL_FIELDS = ["name", "slug", "description", "image", "isActive", "order"];

export const getActiveGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ isActive: true }).sort({ order: 1, name: 1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllGoals = async (req, res) => {
  try {
    const goals = await Goal.find().sort({ order: 1, name: 1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createGoal = async (req, res) => {
  try {
    const data = {};
    for (const field of GOAL_FIELDS) {
      if (req.body[field] !== undefined) data[field] = req.body[field];
    }
    const goal = await Goal.create(data);
    broadcast("site-update", { type: "goal", action: "created" });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    for (const field of GOAL_FIELDS) {
      if (req.body[field] !== undefined) goal[field] = req.body[field];
    }
    await goal.save();
    broadcast("site-update", { type: "goal", action: "updated" });
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findByIdAndDelete(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    broadcast("site-update", { type: "goal", action: "deleted" });
    res.json({ message: "Goal deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
