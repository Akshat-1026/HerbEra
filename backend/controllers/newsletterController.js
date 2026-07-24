import Subscriber from "../models/Subscriber.js";
import { broadcast } from "../utils/sseManager.js";

export const subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Email is required" });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await Subscriber.findOne({ email: normalizedEmail });
    if (existing) {
      if (existing.subscribed) {
        return res.status(200).json({ message: "Already subscribed" });
      }
      existing.subscribed = true;
      await existing.save();
      broadcast("site-update", { type: "newsletter" });
      return res.status(200).json({ message: "Re-subscribed successfully" });
    }
    await Subscriber.create({ email: normalizedEmail });
    broadcast("site-update", { type: "newsletter" });
    res.status(201).json({ message: "Subscribed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Email is required" });
    }
    const subscriber = await Subscriber.findOne({ email: email.toLowerCase().trim() });
    if (!subscriber) {
      return res.status(404).json({ message: "Subscriber not found" });
    }
    subscriber.subscribed = false;
    await subscriber.save();
    broadcast("site-update", { type: "newsletter" });
    res.json({ message: "Unsubscribed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAll = async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
