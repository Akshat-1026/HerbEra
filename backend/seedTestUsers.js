import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const TOTAL_USERS = 100;

const seedTestUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    let created = 0;
    let skipped = 0;

    const ops = [];

    for (let i = 0; i < TOTAL_USERS; i++) {
      const email = `testuser${i}@test.com`;
      const password = await bcrypt.hash("Test@12345", 10);

      ops.push(
        User.findOneAndUpdate(
          { email },
          {
            name: `Test User ${i}`,
            email,
            password,
            isAdmin: false,
          },
          { upsert: true, new: true }
        ).then((doc) => {
          if (doc.wasNew) created++;
          else skipped++;
        })
      );
    }

    await Promise.all(ops);

    console.log(`Done. Created: ${created}, Skipped (already exist): ${skipped}`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding test users:", error.message);
    process.exit(1);
  }
};

seedTestUsers();
