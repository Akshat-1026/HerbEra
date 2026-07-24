import Banner from "../models/Banner.js";
import { broadcast } from "../utils/sseManager.js";

const BANNER_FIELDS = ["title", "subtitle", "description", "image", "link", "isActive", "startDate", "endDate", "order", "bgColor", "textColor"];

const setNoCache = (res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
};

export const getActiveBanners = async (req, res) => {
  try {
    const now = new Date();
    const banners = await Banner.find({
      isActive: true,
      $and: [
        {
          $or: [
            { startDate: { $exists: false } },
            { startDate: null },
            { startDate: { $lte: now } },
          ],
        },
        {
          $or: [
            { endDate: { $exists: false } },
            { endDate: null },
            { endDate: { $gte: now } },
          ],
        },
      ],
    }).sort({ createdAt: -1 });
    setNoCache(res);
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    setNoCache(res);
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createBanner = async (req, res) => {
  try {
    const data = {};
    for (const field of BANNER_FIELDS) {
      if (req.body[field] !== undefined) data[field] = req.body[field];
    }
    const banner = await Banner.create(data);
    setNoCache(res);
    broadcast("site-update", { type: "banner", action: "created" });
    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    for (const field of BANNER_FIELDS) {
      if (req.body[field] !== undefined) banner[field] = req.body[field];
    }
    await banner.save();
    setNoCache(res);
    broadcast("site-update", { type: "banner", action: "updated" });
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    broadcast("site-update", { type: "banner", action: "deleted" });
    res.json({ message: "Banner deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
