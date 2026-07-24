import Combo from "../models/Combo.js";
import { broadcast } from "../utils/sseManager.js";

const COMBO_FIELDS = ["name", "description", "image", "products", "comboPrice", "isActive", "discountPercent"];

export const getCombos = async (req, res) => {
  try {
    const combos = await Combo.find({ isActive: true }).populate("products");
    res.json(combos);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllCombos = async (req, res) => {
  try {
    const combos = await Combo.find().populate("products").sort({ createdAt: -1 });
    res.json(combos);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createCombo = async (req, res) => {
  try {
    const data = {};
    for (const field of COMBO_FIELDS) {
      if (req.body[field] !== undefined) data[field] = req.body[field];
    }
    const combo = await Combo.create(data);
    broadcast("site-update", { type: "combo", action: "created" });
    res.status(201).json(combo);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCombo = async (req, res) => {
  try {
    const combo = await Combo.findById(req.params.id);
    if (!combo) return res.status(404).json({ message: "Combo not found" });
    for (const field of COMBO_FIELDS) {
      if (req.body[field] !== undefined) combo[field] = req.body[field];
    }
    await combo.save();
    broadcast("site-update", { type: "combo", action: "updated" });
    res.json(combo);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCombo = async (req, res) => {
  try {
    const combo = await Combo.findByIdAndDelete(req.params.id);
    if (!combo) return res.status(404).json({ message: "Combo not found" });
    broadcast("site-update", { type: "combo", action: "deleted" });
    res.json({ message: "Combo deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
