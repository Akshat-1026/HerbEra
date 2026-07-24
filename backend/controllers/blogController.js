import Blog from "../models/Blog.js";
import { broadcast } from "../utils/sseManager.js";
import { sanitizeString } from "../utils/sanitize.js";

export const getAllBlogsAdmin = async (req, res) => {
  try {
    const { page: pageQuery, limit: limitQuery } = req.query;
    const page = Number(pageQuery) || 1;
    const limit = Number(limitQuery) || 10000;
    const skip = (page - 1) * limit;
    const total = await Blog.countDocuments();
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json({ blogs, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBlogs = async (req, res) => {
  try {
    const { category, tag, page: pageQuery, limit: limitQuery } = req.query;
    const page = Number(pageQuery) || 1;
    const limit = Number(limitQuery) || 9;
    const skip = (page - 1) * limit;
    const filter = { published: true };

    if (category) filter.category = category;
    if (tag) filter.tags = { $in: [tag] };

    const total = await Blog.countDocuments(filter);
    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-comments");

    res.json({ blogs, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true });
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBlogCategories = async (req, res) => {
  try {
    const categories = await Blog.distinct("category", { published: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createBlog = async (req, res) => {
  try {
    const blog = await Blog.create({
      title: req.body.title,
      slug: req.body.slug,
      excerpt: req.body.excerpt,
      content: req.body.content,
      image: req.body.image,
      category: req.body.category,
      tags: req.body.tags,
      author: req.body.author,
      readTime: req.body.readTime,
      published: req.body.published,
    });
    broadcast("site-update", { type: "blog", action: "created" });
    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (req.body.title !== undefined) blog.title = req.body.title;
    if (req.body.slug !== undefined) blog.slug = req.body.slug;
    if (req.body.excerpt !== undefined) blog.excerpt = req.body.excerpt;
    if (req.body.content !== undefined) blog.content = req.body.content;
    if (req.body.image !== undefined) blog.image = req.body.image;
    if (req.body.category !== undefined) blog.category = req.body.category;
    if (req.body.tags !== undefined) blog.tags = req.body.tags;
    if (req.body.author !== undefined) blog.author = req.body.author;
    if (req.body.readTime !== undefined) blog.readTime = req.body.readTime;
    if (req.body.published !== undefined) blog.published = req.body.published;

    const updated = await blog.save();
    broadcast("site-update", { type: "blog", action: "updated" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    await blog.deleteOne();
    broadcast("site-update", { type: "blog", action: "deleted" });
    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addComment = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true });
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const { name, email, comment } = req.body;
    if (!name || !email || !comment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    blog.comments.push({
      name: sanitizeString(name),
      email: sanitizeString(email),
      comment: sanitizeString(comment),
    });
    await blog.save();
    res.status(201).json(blog.comments[blog.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
