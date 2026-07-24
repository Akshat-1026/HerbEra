import SiteContent from "../models/SiteContent.js";
import { broadcast } from "../utils/sseManager.js";

const SITE_CONTENT_FIELDS = ["heading", "description", "description2", "ctaText", "ctaLink", "image", "imageAlt", "philosophy", "sectionLabel"];

export const getSiteContent = async (req, res) => {
  try {
    const content = await SiteContent.findOne({ page: req.params.page });
    if (!content) return res.json(null);
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const upsertSiteContent = async (req, res) => {
  try {
    const { page } = req.params;
    const update = { page };
    for (const field of SITE_CONTENT_FIELDS) {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    }
    const content = await SiteContent.findOneAndUpdate(
      { page },
      update,
      { new: true, upsert: true }
    );
    broadcast("site-update", { type: "siteContent", action: "updated", page });
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
