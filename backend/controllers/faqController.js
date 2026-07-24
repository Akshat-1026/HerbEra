import FAQ from "../models/FAQ.js";

const FAQ_FIELDS = ["question", "answer", "category", "order", "isActive"];

export const getFAQs = async (req, res) => {
  try {
    const filter = req.query.all === "true" ? {} : { isActive: true };
    const faqs = await FAQ.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createFAQ = async (req, res) => {
  try {
    const data = {};
    for (const field of FAQ_FIELDS) {
      if (req.body[field] !== undefined) data[field] = req.body[field];
    }
    const faq = await FAQ.create(data);
    res.status(201).json(faq);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) return res.status(404).json({ message: "FAQ not found" });
    for (const field of FAQ_FIELDS) {
      if (req.body[field] !== undefined) faq[field] = req.body[field];
    }
    await faq.save();
    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ message: "FAQ not found" });
    res.json({ message: "FAQ deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
