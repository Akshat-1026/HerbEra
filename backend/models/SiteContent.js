import mongoose from "mongoose";

const siteContentSchema = new mongoose.Schema(
  {
    page: { type: String, required: true, unique: true },
    sectionLabel: { type: String, default: "" },
    heading: { type: String, default: "" },
    description: { type: String, default: "" },
    description2: { type: String, default: "" },
    ctaText: { type: String, default: "" },
    ctaLink: { type: String, default: "/products" },
    image: { type: String, default: "" },
    imageAlt: { type: String, default: "" },
    philosophy: [{
      title: { type: String, default: "" },
      desc: { type: String, default: "" },
    }],
  },
  { timestamps: true }
);

const SiteContent = mongoose.model("SiteContent", siteContentSchema);
export default SiteContent;
