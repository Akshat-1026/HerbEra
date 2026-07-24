import express from "express";
import { createContact, getAllContacts, deleteContact } from "../controllers/contactController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { validate, contactSchema } from "../middleware/validate.js";
import { contactLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/", contactLimiter, validate(contactSchema), createContact);
router.get("/admin", protect, admin, getAllContacts);
router.delete("/admin/:id", protect, admin, deleteContact);

export default router;
