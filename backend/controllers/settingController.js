import Setting from "../models/Setting.js";
import { broadcast } from "../utils/sseManager.js";

export const getSettings = async (req, res) => {
  try {
    const settings = await Setting.find();
    const map = {};
    settings.forEach((s) => { map[s.key] = s.value; });
    res.json(map);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key || typeof key !== "string") return res.status(400).json({ message: "Valid key is required" });
    if (value === undefined) return res.status(400).json({ message: "Value is required" });
    const setting = await Setting.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    );
    broadcast("site-update", { type: "setting", action: "updated" });
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const seedDefaultSettings = async () => {
  const defaults = {
    announcement_bar: {
      title: "Pay Day Sale is Live",
      description: "Flat 10% Off Sitewide + Free Gift on Orders Above \u20B91499",
    },
    benefits_bar: [
      { icon: "\uD83C\uDF3F", text: "100% Natural Ingredients" },
      { icon: "\uD83D\uDE9A", text: "Free Shipping Above \u20B9799" },
      { icon: "\u26A1", text: "Fast Dispatch in 24\u201348 Hours" },
      { icon: "\uD83D\uDEE1\uFE0F", text: "FSSAI Certified Products" },
      { icon: "\uD83D\uDCB3", text: "Secure Payments" },
      { icon: "\u2B50", text: "10,000+ Happy Customers" },
    ],
  };

  for (const [key, value] of Object.entries(defaults)) {
    await Setting.findOneAndUpdate(
      { key },
      { $setOnInsert: { value } },
      { upsert: true }
    );
  }
};
