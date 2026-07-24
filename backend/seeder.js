import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import products from "./data/products.js";
import Product from "./models/Product.js";
import Blog from "./models/Blog.js";
import Goal from "./models/Goal.js";
import FAQ from "./models/FAQ.js";

dotenv.config();

connectDB();

const blogs = [
  {
    title: "Daily Ayurvedic Rituals for Modern Life",
    slug: "daily-ayurvedic-rituals-for-modern-life",
    excerpt: "Discover simple daily Ayurvedic rituals that bring balance to your modern lifestyle.",
    content: "Ayurveda, the ancient Indian system of medicine, offers timeless wisdom that can transform your daily routine. By incorporating simple rituals into your day, you can bring balance and harmony to your mind, body, and spirit.\n\nStart your morning with a glass of warm water infused with lemon and honey. This simple practice stimulates digestion and helps flush out toxins accumulated overnight.\n\nOil pulling is another powerful Ayurvedic practice. Swish a tablespoon of organic coconut or sesame oil in your mouth for 10-15 minutes. This ancient technique supports oral health and detoxification.\n\nAbhyanga, or self-massage with warm oil, is a nourishing ritual that calms the nervous system and promotes circulation. Use sesame or almond oil and massage your body before your morning shower.\n\nEnd your day with a cup of warm spiced milk. Add turmeric, ginger, and a pinch of nutmeg for a calming bedtime beverage that supports restful sleep.",
    image: "https://images.unsplash.com/photo-1514996937319-344454492b37?w=800&q=80",
    category: "Wellness",
    tags: ["ayurveda", "daily rituals", "wellness"],
    author: "Herb-Era",
    readTime: 5,
    published: true
  },
  {
    title: "Why Ashwagandha Is Called The King Of Herbs",
    slug: "why-ashwagandha-is-called-the-king-of-herbs",
    excerpt: "Explore the incredible benefits of Ashwagandha, the most revered herb in Ayurvedic medicine.",
    content: "Ashwagandha (Withania somnifera) has been used for thousands of years in Ayurvedic medicine. Its name means 'smell of the horse', referring to both its unique aroma and its ability to impart the strength and vitality of a stallion.\n\nThis adaptogenic herb helps the body manage stress by regulating cortisol levels. Regular consumption can reduce anxiety, improve sleep quality, and enhance overall well-being.\n\nAshwagandha is also known for its cognitive benefits. Studies show it can improve memory, focus, and reaction time. It supports brain health by reducing oxidative stress and inflammation.\n\nFor men, Ashwagandha has been shown to boost testosterone levels and improve fertility. It also enhances physical performance by increasing stamina and muscle strength.\n\nThe root of the Ashwagandha plant is the most commonly used part. It can be consumed as a powder, capsule, or tincture. For best results, take it consistently for at least 8-12 weeks.",
    image: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=800&q=80",
    category: "Herbs",
    tags: ["ashwagandha", "adaptogen", "herbs"],
    author: "Herb-Era",
    readTime: 6,
    published: true
  },
  {
    title: "Natural Ways To Improve Digestion",
    slug: "natural-ways-to-improve-digestion",
    excerpt: "Learn about natural Ayurvedic remedies and lifestyle practices that support healthy digestion.",
    content: "In Ayurveda, digestion is the cornerstone of health. A strong digestive fire, or Agni, is essential for breaking down food and absorbing nutrients. Here are natural ways to support your digestion.\n\nEat according to your dosha. Vata types benefit from warm, moist, and grounding foods. Pitta types thrive on cooling, moderately spiced meals. Kapha types do well with light, warm, and stimulating foods.\n\nChew your food thoroughly. Ayurveda recommends chewing each bite until it becomes liquid. This pre-digests your food and signals your stomach to prepare digestive enzymes.\n\nGinger is a powerful digestive aid. Drink a small cup of fresh ginger tea before meals to stimulate Agni. You can also chew a small piece of fresh ginger with a pinch of rock salt.\n\nTriphala is a classic Ayurvedic formulation that supports gentle detoxification and regular elimination. Take it at bedtime with warm water.\n\nAvoid cold drinks with meals, as they extinguish digestive fire. Instead, sip warm water throughout the day to support digestion and hydration.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
    category: "Lifestyle",
    tags: ["digestion", "ayurveda", "gut health"],
    author: "Herb-Era",
    readTime: 5,
    published: true
  },
  {
    title: "The Power of Triphala: Ayurveda's Ultimate Detox",
    slug: "power-of-triphala-ayurveda-ultimate-detox",
    excerpt: "Triphala is a cornerstone of Ayurvedic medicine. Learn how this three-fruit formula supports detoxification and longevity.",
    content: "Triphala, meaning 'three fruits' in Sanskrit, is one of the most revered formulations in Ayurveda. It consists of Amalaki (Indian gooseberry), Bibhitaki, and Haritaki — each bringing unique benefits.\n\nAmalaki is the richest natural source of Vitamin C and supports immunity and skin health. Bibhitaki supports respiratory health and helps clear excess Kapha. Haritaki is known for its laxative properties and is considered a brain tonic.\n\nTogether, Triphala supports gentle yet effective detoxification of the digestive tract. It regulates bowel movements without causing dependency, making it safe for long-term use.\n\nTriphala is also rich in antioxidants that combat oxidative stress and support healthy aging. Regular consumption can improve digestion, enhance nutrient absorption, and boost overall vitality.\n\nTake one teaspoon of Triphala powder mixed with warm water at bedtime for best results. It is also available in capsule form for convenience.",
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80",
    category: "Herbs",
    tags: ["triphala", "detox", "ayurveda"],
    author: "Herb-Era",
    readTime: 4,
    published: true
  },
  {
    title: "Understanding Your Dosha: A Beginner's Guide",
    slug: "understanding-your-dosha-beginners-guide",
    excerpt: "Learn about the three doshas — Vata, Pitta, and Kapha — and discover how to identify your unique mind-body constitution.",
    content: "In Ayurveda, the doshas are the three fundamental energies that govern our physical and mental processes. Understanding your dominant dosha can help you make better choices about diet, lifestyle, and self-care.\n\nVata is composed of air and ether. It governs movement, creativity, and communication. When balanced, Vata types are energetic and creative. When imbalanced, they experience anxiety, dryness, and irregular digestion.\n\nPitta is composed of fire and water. It governs metabolism, digestion, and transformation. Balanced Pitta types are focused and ambitious. Imbalanced Pitta leads to irritability, inflammation, and heat-related conditions.\n\nKapha is composed of earth and water. It governs structure, stability, and lubrication. Balanced Kapha types are calm and grounded. Imbalanced Kapha causes lethargy, weight gain, and congestion.\n\nMost people are a combination of two doshas. Simple online quizzes can help you identify your constitution, but nothing beats a consultation with an experienced Ayurvedic practitioner.\n\nOnce you know your dosha, you can tailor your diet, exercise, and daily routines to maintain balance and prevent disease.",
    image: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80",
    category: "Wellness",
    tags: ["dosha", "ayurveda", "constitution", "beginner"],
    author: "Herb-Era",
    readTime: 7,
    published: true
  },
  {
    title: "Ayurvedic Morning Routine for Sustained Energy",
    slug: "ayurvedic-morning-routine-sustained-energy",
    excerpt: "Transform your mornings with this Ayurvedic routine designed to boost energy and mental clarity throughout the day.",
    content: "How you start your morning sets the tone for the entire day. Ayurveda offers a time-tested morning routine, or Dinacharya, that aligns your body with nature's rhythms.\n\nWake up before sunrise, during the Vata time of day (around 6:00 AM). This period is associated with lightness and creativity. Waking up early gives you a head start on the day.\n\nScrape your tongue with a copper tongue scraper to remove toxins, or Ama, that accumulated overnight. This simple practice also stimulates digestion and freshens breath.\n\nDrink a glass of warm water, ideally from a copper vessel. This hydrates your body and kickstarts your metabolism. Add lemon or ginger for an extra cleansing boost.\n\nPractice oil pulling with organic sesame or coconut oil for 10-15 minutes. This ancient technique supports oral health and draws toxins from the body.\n\nFollow with a gentle yoga practice or a walk in nature. Exercise during the Kapha time of day (6-10 AM) is especially grounding and energizing.\n\nFinish with a warm, nourishing breakfast that suits your dosha. Avoid cold or heavy foods first thing in the morning.",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    category: "Lifestyle",
    tags: ["morning routine", "dinacharya", "ayurveda", "energy"],
    author: "Herb-Era",
    readTime: 6,
    published: true
  },
  {
    title: "Brahmi: The Herb That Sharpens Your Mind",
    slug: "brahmi-herb-that-sharpens-your-mind",
    excerpt: "Brahmi has been used for centuries to enhance memory, focus, and cognitive function. Discover why it's called the brain herb.",
    content: "Brahmi (Bacopa monnieri) is one of the most celebrated herbs in Ayurveda for its profound effects on the brain and nervous system. Its name is derived from Brahma, the Hindu god of creation, reflecting its ability to enhance consciousness.\n\nBrahmi is classified as a Medhya Rasayana — a rejuvenative for the mind. It improves cognitive function by protecting neurons and promoting the growth of dendrites, the branches that connect brain cells.\n\nClinical studies have shown that Brahmi can improve memory retention, learning rates, and information processing speed. It is particularly beneficial for students and aging adults.\n\nBrahmi also has adaptogenic properties that help the body cope with stress. It calms the mind without causing drowsiness, making it an excellent choice for those dealing with anxiety or ADHD.\n\nThe herb can be consumed as a powder mixed with warm milk or ghee, as a capsule, or as a tincture. For best results, take it consistently for at least 8-12 weeks.\n\nAlways consult with an Ayurvedic practitioner before adding Brahmi to your regimen, especially if you are taking medication.",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80",
    category: "Herbs",
    tags: ["brahmi", "memory", "cognitive", "brain health"],
    author: "Herb-Era",
    readTime: 5,
    published: true
  },
  {
    title: "Seasonal Eating: Ayurvedic Guide to Summer Nutrition",
    slug: "seasonal-eating-ayurvedic-guide-summer-nutrition",
    excerpt: "Adjust your diet according to the seasons with this Ayurvedic guide to summer eating for optimal health and vitality.",
    content: "Ayurveda teaches that eating according to the seasons is essential for maintaining health. As the seasons change, so do the doshas, and our diet must adapt accordingly.\n\nSummer is the season of Pitta — hot, sharp, and intense. To stay cool and balanced, favor foods that are sweet, bitter, and astringent in taste. Avoid pungent, sour, and salty foods that aggravate Pitta.\n\nEat plenty of fresh, seasonal fruits like watermelon, cantaloupe, and berries. These fruits are naturally cooling and hydrating. Enjoy them on their own, not combined with other foods.\n\nInclude leafy greens such as kale, spinach, and lettuce in your meals. Bitter greens help cool the body and support liver function. Cucumber, zucchini, and celery are also excellent choices.\n\nStay hydrated with infused waters. Add mint, cucumber, rose petals, or lemon to your water for a refreshing and Pitta-pacifying beverage. Avoid iced drinks — room temperature or cool water is better.\n\nUse cooling spices like fennel, coriander, mint, and cardamom in your cooking. These spices aid digestion without generating heat.\n\nEnd your meals with something sweet and cooling, like a small bowl of fresh berries or a date. This satisfies the sweet taste that Pitta craves without overwhelming your system.",
    image: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800&q=80",
    category: "Lifestyle",
    tags: ["seasonal eating", "summer", "pitta", "nutrition"],
    author: "Herb-Era",
    readTime: 6,
    published: true
  }
];

const goals = [
  {
    name: "Daily Vitality",
    slug: "daily-vitality",
    description: "Restore natural energy and resilience.",
    image: "",
    isActive: true,
    order: 0,
  },
  {
    name: "Deep Restoration",
    slug: "deep-restoration",
    description: "Support calm, recovery, and restorative sleep.",
    image: "",
    isActive: true,
    order: 1,
  },
  {
    name: "Mind Clarity",
    slug: "mind-clarity",
    description: "Enhance focus, memory, and mental performance.",
    image: "",
    isActive: true,
    order: 2,
  },
  {
    name: "Inner Balance",
    slug: "inner-balance",
    description: "Nourish digestion, immunity, and overall wellbeing.",
    image: "",
    isActive: true,
    order: 3,
  },
];

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
    answer: "Store all products in a cool, dry place away from direct sunlight. Keep the containers tightly sealed after use. Some products like oils and powders may have specific storage instructions mentioned on the label — please follow those.",
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
    answer: "Click 'Login / Register' in the top navigation bar. You can sign up with your email address and a password. You can also browse and purchase as a guest, but creating an account lets you track orders, manage your wishlist, and earn rewards.",
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
    answer: "Most of our products are 100% vegan and plant-based. Some formulations may contain ghee or honey — these are clearly mentioned in the product description and ingredients list. Look for the 'Vegan' tag on product pages.",
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

const importData = async () => {
  try {
    const [productCount, blogCount, goalCount, faqCount] = await Promise.all([
      Product.countDocuments(),
      Blog.countDocuments(),
      Goal.countDocuments(),
      FAQ.countDocuments(),
    ]);

    if (productCount > 0 || blogCount > 0 || goalCount > 0 || faqCount > 0) {
      console.log("Database already seeded — skipping to preserve existing data.");
      process.exit();
    }

    await Product.insertMany(products);
    await Blog.insertMany(blogs);
    await Goal.insertMany(goals);
    await FAQ.insertMany(faqs);

    console.log("Data Imported Successfully! 🎉");
    process.exit();
  } catch (error) {
    console.error(`Error during data seeding: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();
    await Blog.deleteMany();
    await Goal.deleteMany();
    await FAQ.deleteMany();
    console.log("Data Destroyed Successfully! 🔥");
    process.exit();
  } catch (error) {
    console.error(`Error during data destruction: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else if (process.argv[2] === "-f") {
  await Product.deleteMany();
  await Blog.deleteMany();
  await Goal.deleteMany();
  await FAQ.deleteMany();
  console.log("Database cleared...");
  await Product.insertMany(products);
  await Blog.insertMany(blogs);
  await Goal.insertMany(goals);
  await FAQ.insertMany(faqs);
  console.log("Data Re-seeded Successfully! 🎉");
  process.exit();
} else {
  importData();
}