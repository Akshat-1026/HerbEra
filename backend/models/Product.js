import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    sku: {
      type: String,
      unique: true,
      sparse: true,
    },

    category: {
      type: String,
      required: true,
    },

    hsnCode: {
      type: String,
      default: "1211",
    },

    price: {
      type: Number,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    rating: {
      type: Number,
      default: 0,
    },

    numReviews: {
      type: Number,
      default: 0,
    },

    countInStock: {
      type: Number,
      default: 0,
    },

    ingredients: [String],

    benefits: [String],

    usageInstructions: String,

    sideEffects: String,

    certifications: [String],

    images: [String],
    video: { type: String, default: "" },

    isBestseller: {
      type: Boolean,
      default: false,
    },

    isNewArrival: {
      type: Boolean,
      default: false,
    },

    herbalType: {
      type: String,
      enum: ["single", "compound", "formulation"],
      default: "single",
    },

    goals: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
    }],

    variants: [{
      label: { type: String, required: true },
      price: { type: Number, required: true },
      originalPrice: { type: Number },
      countInStock: { type: Number, default: 0 },
    }],
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;