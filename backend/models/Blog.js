import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  tags: [String],
  author: { type: String, default: "Herb-Era" },
  readTime: { type: Number, default: 5 },
  published: { type: Boolean, default: true },
  comments: [{
    name: String,
    email: String,
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;
