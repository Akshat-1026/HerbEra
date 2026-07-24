import Testimonial from "../models/Testimonial.js";
import { broadcast } from "../utils/sseManager.js";
import { sanitizeObject, sanitizeString } from "../utils/sanitize.js";

export const getTestimonials = async (req, res) => {
  try {
    const filter = req.query.all === "true" ? {} : { isActive: true };
    const testimonials = await Testimonial.find(filter).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createTestimonial = async (req, res) => {
  try {
    const { name, location, text, rating, image, video } = req.body;
    const sanitized = sanitizeObject({ name, location, text, rating, image, video }, ["name", "location", "text", "image", "video"]);
    const testimonial = await Testimonial.create(sanitized);
    broadcast("site-update", { type: "testimonial", action: "created" });
    res.status(201).json(testimonial);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTestimonial = async (req, res) => {
  try {
    const TESTIMONIAL_FIELDS = ["name", "location", "text", "rating", "isActive", "image", "video"];
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ message: "Testimonial not found" });
    for (const field of TESTIMONIAL_FIELDS) {
      if (req.body[field] !== undefined) {
        testimonial[field] = ["name", "location", "text", "image", "video"].includes(field) && typeof req.body[field] === "string"
          ? sanitizeString(req.body[field])
          : req.body[field];
      }
    }
    await testimonial.save();
    broadcast("site-update", { type: "testimonial", action: "updated" });
    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return res.status(404).json({ message: "Testimonial not found" });
    broadcast("site-update", { type: "testimonial", action: "deleted" });
    res.json({ message: "Testimonial deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
