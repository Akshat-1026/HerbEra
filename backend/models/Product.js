import mongoose from "mongoose";

const translationFields = {
  name: { type: String, default: "" },
  description: { type: String, default: "" },
  benefits: { type: [String], default: [] },
  ingredients: { type: [String], default: [] },
  usageInstructions: { type: String, default: "" },
  sideEffects: { type: String, default: "" },
};

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

    translations: {
      type: Map,
      of: new mongoose.Schema(translationFields, { _id: false }),
      default: {},
    },

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

productSchema.methods.getLocalized = function (lang = "en") {
  const t = this.translations?.get(lang) || {};
  return {
    ...this.toObject(),
    name: t.name || this.name,
    description: t.description || this.description,
    benefits: t.benefits?.length > 0 ? t.benefits : this.benefits,
    ingredients: t.ingredients?.length > 0 ? t.ingredients : this.ingredients,
    usageInstructions: t.usageInstructions || this.usageInstructions,
    sideEffects: t.sideEffects || this.sideEffects,
  };
};

const Product = mongoose.model("Product", productSchema);

export default Product;
