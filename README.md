# Herb-era — Ayurvedic Wellness Store

A full-stack e-commerce application for Ayurvedic herbal products built with React (Vite) and Node.js (Express + MongoDB).

---

## How to Run

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)

### 1. Backend

```bash
cd backend
npm install
npm run seed    # Seeds the database with sample products
npm start       # Starts the server on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev     # Starts Vite dev server on http://localhost:5173
```

The frontend proxies `/api` requests to the backend (configured in `vite.config.js`), so both must be running simultaneously.

---

## Features

- Product listing with search, sort, and category filter
- Product detail page with image gallery
- Shopping cart (local storage)
- Wishlist (persisted to backend)
- Coupon discount system
- Checkout with shipping form
- Order tracking
- User authentication (register / login)
- Journal / blog section
- Dark mode toggle
- Responsive design

---

## Fixes & Changes Made

### API & Data Flow
- **AuthContext** — Fixed login (`/api/users/login` → `/api/auth/login`) and register (`/api/users` → `/api/auth/register`) endpoints to match backend routes.
- **WishlistContext** — Fixed case-sensitive URL mismatch: changed `/api/wishlist` → `/api/Wishlist` to match the backend route definition.
- **WishlistContext** — Added `addToWishlist` and `removeFromWishlist` exports so `ProductDetails.jsx` can use them.
- **CartHook** — Added missing `totalPrice` computed property and `clearCart` function.
- **TrackOrder** — Connected to the real backend API (`/api/orders/:id`) instead of local storage mock.
- **Footer** — Replaced `<a href>` tags with React Router `<Link>` components to prevent full page reloads.

### Theme & UI Consistency
- **Login page** — Rewrote from inline dark-navy styles to Tailwind classes matching the site's warm earthy theme (`bg-[#f8f5ef]`, green accents, dark mode support).
- **Register page** — Same treatment as Login for visual consistency.
- **Wishlist page** — Restyled from dark navy (`#06142b`) to match the rest of the site (`bg-[#f8f5ef]`, white cards, dark mode).
- **Checkout** — Fixed `item.qty` → `item.quantity` to match how the cart stores item quantities.

### Images
- **Home page journal section** — Was using non-existent `/images/journal1.jpg`, `journal2.jpg`, `journal3.jpg`. Replaced with working Unsplash URLs.
- **About page** — `/images/about-founder.jpg` didn't exist. Replaced with an existing product image.
- **All images** — Added `loading="lazy"` and `decoding="async"` for faster page loads.
- **Unsplash URLs** — Added `?w=800&q=80` / `?w=1200&q=80` parameters to serve optimized image sizes instead of full-resolution originals.

### Database
- **Seeded** the database with 3 products (Ashwagandha Capsules, Triphala Powder, Shilajit Resin).
