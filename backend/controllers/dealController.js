import Deal from "../models/Deal.js";
import { broadcast } from "../utils/sseManager.js";

const DEAL_FIELDS = ["name", "description", "type", "discountType", "discountValue", "products", "isActive", "startsAt", "endsAt", "minPurchase", "maxUses", "usedCount", "image"];

export const getActiveDeals = async (req, res) => {
  try {
    const now = new Date();
    const deals = await Deal.find({
      isActive: true,
      startsAt: { $lte: now },
      endsAt: { $gte: now }
    }).populate("products").sort({ endsAt: 1 });
    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getDealByType = async (req, res) => {
  try {
    const { type } = req.params;
    const now = new Date();
    const deals = await Deal.find({
      type,
      isActive: true,
      startsAt: { $lte: now },
      endsAt: { $gte: now }
    }).populate("products").sort({ endsAt: 1 });
    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllDealsAdmin = async (req, res) => {
  try {
    const deals = await Deal.find().sort({ createdAt: -1 });
    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createDeal = async (req, res) => {
  try {
    const data = {};
    for (const field of DEAL_FIELDS) {
      if (req.body[field] !== undefined) data[field] = req.body[field];
    }
    const deal = await Deal.create(data);
    broadcast("site-update", { type: "deal", action: "created" });
    res.status(201).json(deal);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ message: "Deal not found" });
    for (const field of DEAL_FIELDS) {
      if (req.body[field] !== undefined) deal[field] = req.body[field];
    }
    await deal.save();
    broadcast("site-update", { type: "deal", action: "updated" });
    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);
    if (!deal) return res.status(404).json({ message: "Deal not found" });
    broadcast("site-update", { type: "deal", action: "deleted" });
    res.json({ message: "Deal deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
