import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  discountPercentage: { type: Number, required: true, min: 1, max: 100 },
  link: { type: String, default: "/products" },
  image: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
  startDate: { type: Date },
  endDate: { type: Date },
}, { timestamps: true });

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;
