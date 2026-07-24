import mongoose from "mongoose";

const dealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["flash_sale", "daily_deal", "combo", "bogo", "festival"], required: true },
  discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
  discountValue: { type: Number, required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  minPurchase: { type: Number, default: 0 },
  startsAt: { type: Date, required: true },
  endsAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  bannerImage: String,
  couponCode: String,
}, { timestamps: true });

const Deal = mongoose.model("Deal", dealSchema);
export default Deal;
