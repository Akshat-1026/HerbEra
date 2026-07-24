import express from "express";
import Product from "../models/Product.js";
import Blog from "../models/Blog.js";
import config from "../config/index.js";

const router = express.Router();

router.get("/sitemap.xml", async (req, res) => {
  try {
    const baseUrl = config.frontendUrl;
    const products = await Product.find({}).select("slug updatedAt").lean();
    const blogs = await Blog.find({}).select("slug updatedAt").lean();

    const urls = [
      { loc: "/", priority: 1.0, changefreq: "daily" },
      { loc: "/products", priority: 0.9, changefreq: "daily" },
      { loc: "/about", priority: 0.6, changefreq: "monthly" },
      { loc: "/contact", priority: 0.6, changefreq: "monthly" },
      { loc: "/blog", priority: 0.8, changefreq: "weekly" },
      { loc: "/search", priority: 0.5, changefreq: "weekly" },
      { loc: "/track-order", priority: 0.4, changefreq: "monthly" },
      { loc: "/cart", priority: 0.3, changefreq: "monthly" },
      ...products.map((p) => ({
        loc: `/products/${p.slug || p._id}`,
        priority: 0.8,
        changefreq: "weekly",
        lastmod: p.updatedAt,
      })),
      ...blogs.map((b) => ({
        loc: `/blog/${b.slug}`,
        priority: 0.7,
        changefreq: "monthly",
        lastmod: b.updatedAt,
      })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${baseUrl}${u.loc}</loc>
    <priority>${u.priority}</priority>
    <changefreq>${u.changefreq}</changefreq>
    ${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ""}
  </url>`
  )
  .join("\n")}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch {
    res.status(500).send("Error generating sitemap");
  }
});

export default router;
