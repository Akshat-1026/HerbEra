import Product from "../models/Product.js";
import Goal from "../models/Goal.js";
import { broadcast } from "../utils/sseManager.js";
import { escapeRegex } from "../utils/sanitize.js";

/* =========================
   GET ALL PRODUCTS
========================= */

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("goals", "name slug");

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

/* =========================
   GET SINGLE PRODUCT
========================= */

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

/* =========================
   GENERATE SKU
========================= */

const generateSku = async (category) => {
  const prefix = category
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);

  const last = await Product.findOne({ sku: new RegExp(`^HE-${escapeRegex(prefix)}-`) })
    .sort({ sku: -1 })
    .select("sku");

  let num = 1;
  if (last && last.sku) {
    const parts = last.sku.split("-");
    num = parseInt(parts[2], 10) + 1;
  }

  return `HE-${prefix}-${String(num).padStart(3, "0")}`;
};

/* =========================
   CREATE PRODUCT
========================= */

export const createProduct = async (req, res) => {
  try {
    const sku = await generateSku(req.body.category || req.body.name);

    const product = await Product.create({
      name: req.body.name,
      sku,
      image: req.body.image,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      countInStock: req.body.countInStock,
      variants: req.body.variants || [],
      goals: req.body.goals || [],
      ingredients: req.body.ingredients || [],
      benefits: req.body.benefits || [],
      usageInstructions: req.body.usageInstructions || "",
      sideEffects: req.body.sideEffects || "",
      certifications: req.body.certifications || [],
      images: req.body.images || [],
      video: req.body.video || "",
      isBestseller: req.body.isBestseller || false,
      isNewArrival: req.body.isNewArrival || false,
      herbalType: req.body.herbalType || "single",
      hsnCode: req.body.hsnCode || "1211",
    });

    broadcast("site-update", { type: "product", action: "created" });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

/* =========================
   UPDATE PRODUCT
========================= */

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (req.body.name !== undefined) {
      product.name = req.body.name;
    }

    if (req.body.sku !== undefined) {
      product.sku = req.body.sku;
    }

    if (req.body.image !== undefined) {
      product.image = req.body.image;
    }

    if (req.body.description !== undefined) {
      product.description = req.body.description;
    }

    if (req.body.category !== undefined) {
      product.category = req.body.category;
    }

    if (req.body.price !== undefined) {
      product.price = req.body.price;
    }

    if (req.body.countInStock !== undefined) {
      product.countInStock = req.body.countInStock;
    }

    if (req.body.variants !== undefined) {
      product.variants = req.body.variants;
    }

    if (req.body.goals !== undefined) {
      product.goals = req.body.goals;
    }

    if (req.body.ingredients !== undefined) {
      product.ingredients = req.body.ingredients;
    }

    if (req.body.benefits !== undefined) {
      product.benefits = req.body.benefits;
    }

    if (req.body.usageInstructions !== undefined) {
      product.usageInstructions = req.body.usageInstructions;
    }

    if (req.body.sideEffects !== undefined) {
      product.sideEffects = req.body.sideEffects;
    }

    if (req.body.certifications !== undefined) {
      product.certifications = req.body.certifications;
    }

    if (req.body.images !== undefined) {
      product.images = req.body.images;
    }

    if (req.body.video !== undefined) {
      product.video = req.body.video;
    }

    if (req.body.isBestseller !== undefined) {
      product.isBestseller = req.body.isBestseller;
    }

    if (req.body.isNewArrival !== undefined) {
      product.isNewArrival = req.body.isNewArrival;
    }

    if (req.body.herbalType !== undefined) {
      product.herbalType = req.body.herbalType;
    }

    if (req.body.hsnCode !== undefined) {
      product.hsnCode = req.body.hsnCode;
    }

    const updatedProduct = await product.save();

    broadcast("site-update", { type: "product", action: "updated" });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

/* =========================
   SEARCH PRODUCTS
========================= */

export const searchProducts = async (req, res) => {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      rating,
      sort,
      page: pageQuery,
      limit: limitQuery,
      isBestseller,
      isNewArrival,
      herbalType,
      inStock,
    } = req.query;

    const page = Number(pageQuery) || 1;
    const limit = Number(limitQuery) || 12;
    const skip = (page - 1) * limit;

    const filter = {};

    if (q) {
      const safeQ = escapeRegex(String(q));
      filter.$or = [
        { name: { $regex: safeQ, $options: "i" } },
        { description: { $regex: safeQ, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      const priceFilters = [
        { price: {} },
        { "variants.price": {} },
      ];
      if (minPrice) {
        priceFilters[0].price.$gte = Number(minPrice);
        priceFilters[1]["variants.price"].$gte = Number(minPrice);
      }
      if (maxPrice) {
        priceFilters[0].price.$lte = Number(maxPrice);
        priceFilters[1]["variants.price"].$lte = Number(maxPrice);
      }
      if (filter.$or) {
        const textOr = filter.$or;
        delete filter.$or;
        filter.$and = [
          { $or: textOr },
          { $or: priceFilters },
        ];
      } else {
        filter.$or = priceFilters;
      }
    }

    if (rating) {
      filter.rating = { $gte: Number(rating) };
    }

    if (isBestseller === "true") {
      filter.isBestseller = true;
    }

    if (isNewArrival === "true") {
      filter.isNewArrival = true;
    }

    if (herbalType) {
      filter.herbalType = herbalType;
    }

    if (req.query.goal) {
      const goals = await Goal.find({ slug: req.query.goal }).select("_id");
      if (goals.length > 0) {
        filter.goals = { $in: goals.map((g) => g._id) };
      }
    }

    if (inStock === "true") {
      filter.countInStock = { $gt: 0 };
    }

    let sortOption = {};

    switch (sort) {
      case "price_asc":
        sortOption = { price: 1 };
        break;
      case "price_desc":
        sortOption = { price: -1 };
        break;
      case "rating":
        sortOption = { rating: -1 };
        break;
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "name_asc":
        sortOption = { name: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    res.json({
      products,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

/* =========================
   DELETE PRODUCT
========================= */

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await product.deleteOne();

    broadcast("site-update", { type: "product", action: "deleted" });
    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};