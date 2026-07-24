import mongoose from "mongoose";

const comboSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: String,
  image: { type: String, required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  comboPrice: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

comboSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
  next();
});

const Combo = mongoose.model("Combo", comboSchema);
export default Combo;
