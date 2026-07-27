import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";

dotenv.config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const products = await Product.find({});
    console.log(`Found ${products.length} products to migrate`);

    let updated = 0;
    for (const product of products) {
      const enTranslation = {
        name: product.name,
        description: product.description,
        benefits: product.benefits || [],
        ingredients: product.ingredients || [],
        usageInstructions: product.usageInstructions || "",
        sideEffects: product.sideEffects || "",
      };

      product.translations.set("en", enTranslation);
      await product.save({ validateBeforeSave: false });
      updated++;
      console.log(`  Migrated: ${product.name}`);
    }

    console.log(`\nMigration complete: ${updated}/${products.length} products updated`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrate();
