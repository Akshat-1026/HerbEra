import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import FAQ from "./models/FAQ.js";

dotenv.config();

const faqs = [
  {
    question: "Are your products 100% organic and natural?",
    answer: "Yes, all our products are made from certified organic herbs sourced directly from trusted farms. We use no artificial colors, preservatives, or synthetic chemicals. Every ingredient is lab-tested for purity and potency.",
    category: "Products",
    order: 1,
    isActive: true,
  },
  {
    question: "How long does delivery take?",
    answer: "Standard delivery takes 3–5 business days across India. Metro cities usually receive orders within 2–3 days. You will receive a tracking link via email and SMS once your order is shipped.",
    category: "Shipping",
    order: 2,
    isActive: true,
  },
  {
    question: "What is your return and refund policy?",
    answer: "We offer a hassle-free 7-day return policy. If you are not satisfied with your purchase, you can initiate a return from your account. Once we receive the returned item, your refund will be processed within 5–7 business days.",
    category: "Returns",
    order: 3,
    isActive: true,
  },
  {
    question: "Do you offer Cash on Delivery (COD)?",
    answer: "Yes, Cash on Delivery is available for orders up to ₹5,000 across most pin codes in India. COD charges of ₹49 may apply for orders below ₹500.",
    category: "Payment",
    order: 4,
    isActive: true,
  },
  {
    question: "Are your products safe for daily use?",
    answer: "All our Ayurvedic formulations are designed for regular use. However, we recommend following the dosage instructions on the packaging. If you have a pre-existing medical condition or are pregnant, please consult your healthcare provider before use.",
    category: "Products",
    order: 5,
    isActive: true,
  },
  {
    question: "How do I track my order?",
    answer: "Once your order is shipped, you will receive a tracking number via email and SMS. You can also track your order from the 'My Orders' section in your account dashboard.",
    category: "Shipping",
    order: 6,
    isActive: true,
  },
  {
    question: "Can I cancel my order after placing it?",
    answer: "Yes, you can cancel your order within 24 hours of placing it, provided it has not been shipped. Go to 'My Orders' and click 'Cancel' to initiate the cancellation. Refunds for cancelled orders are processed within 5–7 business days.",
    category: "Orders",
    order: 7,
    isActive: true,
  },
  {
    question: "Do you ship internationally?",
    answer: "Currently, we only ship within India. We are working on expanding our shipping to international locations. Stay tuned for updates by subscribing to our newsletter.",
    category: "Shipping",
    order: 8,
    isActive: true,
  },
  {
    question: "How should I store these herbal products?",
    answer: "Store all products in a cool, dry place away from direct sunlight. Keep the containers tightly sealed after use. Some products like oils and powders may have specific storage instructions mentioned on the label.",
    category: "Products",
    order: 9,
    isActive: true,
  },
  {
    question: "Are your products tested on animals?",
    answer: "Absolutely not. Herb-Era is a cruelty-free brand. None of our products are tested on animals at any stage of production. We are committed to ethical and sustainable practices.",
    category: "Products",
    order: 10,
    isActive: true,
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept UPI (Google Pay, PhonePe, Paytm), credit/debit cards, net banking, wallets, and Cash on Delivery. All online transactions are secured with industry-standard encryption.",
    category: "Payment",
    order: 11,
    isActive: true,
  },
  {
    question: "How do I create an account?",
    answer: "Click 'Login / Register' in the top navigation bar. You can sign up with your email address and a password. Creating an account lets you track orders, manage your wishlist, and earn rewards.",
    category: "Account",
    order: 12,
    isActive: true,
  },
  {
    question: "Do you offer bulk or wholesale pricing?",
    answer: "Yes, we offer special pricing for bulk and wholesale orders. Please contact our team at info@herb-era.com with your requirements and we will get back to you with a custom quote.",
    category: "Orders",
    order: 13,
    isActive: true,
  },
  {
    question: "Are your products suitable for vegetarians and vegans?",
    answer: "Most of our products are 100% vegan and plant-based. Some formulations may contain ghee or honey — these are clearly mentioned in the product description and ingredients list.",
    category: "Products",
    order: 14,
    isActive: true,
  },
  {
    question: "How do I contact customer support?",
    answer: "You can reach us via email at info@herb-era.com or through the contact form on our Contact page. Our support team responds within 24 hours on business days.",
    category: "General",
    order: 15,
    isActive: true,
  },
];

const seedFAQs = async () => {
  try {
    await connectDB();

    const existing = await FAQ.countDocuments();
    if (existing > 0) {
      console.log(`${existing} FAQs already exist — clearing and re-seeding...`);
      await FAQ.deleteMany();
    }

    await FAQ.insertMany(faqs);
    console.log(`${faqs.length} FAQs seeded successfully!`);
    process.exit();
  } catch (error) {
    console.error("FAQ seed error:", error.message);
    process.exit(1);
  }
};

seedFAQs();
