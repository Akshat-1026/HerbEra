import Contact from "../models/Contact.js";
import { broadcast } from "../utils/sseManager.js";
import { sanitizeObject } from "../utils/sanitize.js";

export const createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const sanitized = sanitizeObject({ name, email, subject, message }, ["name", "subject", "message"]);
    await Contact.create(sanitized);
    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    broadcast("site-update", { type: "contact", action: "deleted" });
    res.json({ message: "Contact deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
