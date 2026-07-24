import { z } from "zod";

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return res.status(400).json({ message: "Validation failed", errors });
  }
  req.validated = result.data;
  next();
};

/* ==========================
   AUTH SCHEMAS
   ========================== */

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format").max(255),
    password: z.string().min(1, "Password is required").max(128),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email format").max(255),
    password: z.string().min(8, "Password must be at least 8 characters").max(128)
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format").max(255),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(8, "Password must be at least 8 characters").max(128),
  }),
});

/* ==========================
   PRODUCT SCHEMAS
   ========================== */

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(200),
    description: z.string().min(1, "Description is required").max(10000),
    price: z.number().positive("Price must be positive"),
    category: z.string().min(1, "Category is required"),
    image: z.string().url("Invalid image URL").optional().or(z.literal("")),
    stock: z.number().int().min(0, "Stock cannot be negative"),
    isBestseller: z.boolean().optional(),
    isNewArrival: z.boolean().optional(),
    goals: z.array(z.string()).optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(10000).optional(),
    price: z.number().positive().optional(),
    category: z.string().min(1).optional(),
    image: z.string().optional(),
    stock: z.number().int().min(0).optional(),
    isBestseller: z.boolean().optional(),
    isNewArrival: z.boolean().optional(),
    goals: z.array(z.string()).optional(),
  }),
});

/* ==========================
   COUPON SCHEMAS
   ========================== */

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3, "Code must be at least 3 characters").max(50).transform((v) => v.toUpperCase()),
    discount: z.number().min(1, "Discount must be at least 1").max(100, "Discount cannot exceed 100"),
    expiry: z.string().datetime("Invalid date format").or(z.date()),
    type: z.enum(["percentage", "flat"]).optional(),
    minPurchase: z.number().min(0).optional(),
    maxDiscount: z.number().min(0).optional(),
    usageLimit: z.number().int().min(1).optional(),
  }),
});

/* ==========================
   ORDER SCHEMAS
   ========================== */

export const createOrderSchema = z.object({
  body: z.object({
    orderItems: z.array(z.object({
      product: z.string().min(1),
      name: z.string().min(1),
      price: z.number().positive(),
      qty: z.number().int().positive(),
      image: z.string().optional(),
      sku: z.string().optional(),
    })).min(1, "At least one order item is required"),
    shippingAddress: z.object({
      address: z.string().min(5, "Address is required"),
      city: z.string().min(2, "City is required"),
      state: z.string().min(2, "State is required"),
      postalCode: z.string().min(4, "Valid postal code required"),
      country: z.string().min(2).optional(),
    }),
    paymentMethod: z.string().min(1, "Payment method is required"),
    couponCode: z.string().optional(),
  }),
});

/* ==========================
   REVIEW SCHEMAS
   ========================== */

export const createReviewSchema = z.object({
  body: z.object({
    product: z.string().min(1, "Product ID is required"),
    rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
    comment: z.string().max(1000, "Comment too long").optional(),
  }),
});

/* ==========================
   CONTACT SCHEMAS
   ========================== */

export const contactSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name is required").max(100),
    email: z.string().email("Invalid email").max(255),
    subject: z.string().min(3, "Subject is required").max(200),
    message: z.string().min(10, "Message must be at least 10 characters").max(5000),
  }),
});

/* ==========================
   FAQ SCHEMAS
   ========================== */

export const createFaqSchema = z.object({
  body: z.object({
    question: z.string().min(5, "Question is required").max(500),
    answer: z.string().min(5, "Answer is required").max(5000),
    category: z.string().max(100).optional(),
    order: z.number().int().min(0).optional(),
  }),
});

/* ==========================
   GOAL SCHEMAS
   ========================== */

export const createGoalSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(100),
    slug: z.string().min(1, "Slug is required").max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
    description: z.string().max(500).optional(),
    image: z.string().max(500).optional(),
    order: z.number().int().min(0).optional(),
  }),
});

/* ==========================
   BLOG SCHEMAS
   ========================== */

export const createBlogSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title is required").max(300),
    content: z.string().min(10, "Content is required").max(50000),
    category: z.string().max(100).optional(),
    image: z.string().max(500).optional(),
    tags: z.array(z.string().max(50)).max(10).optional(),
  }),
});
