import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { X, Zap, ArrowRight, Flame } from "lucide-react";

const SaleBanner = () => {
  const [banners, setBanners] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    let active = true;
    axios
      .get(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/banners/active?_=${Date.now()}`)
      .then((res) => { if (active) setBanners(res.data); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const dismiss = (id) => setDismissed((prev) => [...prev, id]);

  const visible = banners.filter((b) => !dismissed.includes(b._id));
  if (!visible.length) return null;

  return (
    <div className="relative z-10 w-full">
      {visible.map((banner) => (
        <BannerCard key={banner._id} banner={banner} onDismiss={dismiss} />
      ))}
    </div>
  );
};

function BannerCard({ banner, onDismiss }) {
  const scrollRef = useRef(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let active = true;
    axios
      .get(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/products?limit=50`)
      .then((res) => { if (active) setProducts(res.data); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let animId;
    let speed = 0.5;
    let paused = false;

    const onEnter = () => { paused = true; };
    const onLeave = () => { paused = false; };

    const tick = () => {
      if (!paused && el.scrollWidth > el.clientWidth) {
        el.scrollLeft += speed;
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth) {
          el.scrollLeft = 0;
        }
      }
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(animId);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [products.length]);

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#5C3D2E] via-[#8B6914] to-[#5C3D2E] p-[2px] shadow-xl shadow-[#5C3D2E]/25 transition-shadow hover:shadow-[#8B6914]/30">
      <div className="relative overflow-hidden rounded-[14px] bg-gradient-to-br from-[#3B2314] via-[#4A3020] to-[#3B2314]">
        {/* Animated background glows */}
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[#8B6914]/20 blur-3xl"
            animate={{ x: [0, 30, 0], y: [0, 15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-[#A67C52]/15 blur-3xl"
            animate={{ x: [0, -25, 0], y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Dismiss */}
        <button
          onClick={() => onDismiss(banner._id)}
          className="absolute right-2 top-2 z-30 rounded-full bg-[#8B6914]/20 p-1.5 text-[#A67C52]/60 backdrop-blur-sm transition hover:bg-[#8B6914]/40 hover:text-white"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>

        {/* Content: left text | center products | right discount+CTA */}
        <div className="relative z-10 flex flex-col items-center gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
          {/* Left: banner image + text */}
          <div className="flex items-center gap-4">
            {banner.image && (
              <img
                src={banner.image}
                alt={banner.title}
                className="hidden h-14 w-14 rounded-xl object-cover ring-2 ring-[#A67C52]/30 sm:block sm:h-16 sm:w-16"
              />
            )}
            <div className="text-center sm:text-left">
              <div className="mb-0.5 flex items-center justify-center gap-1 sm:justify-start">
                <Flame size={12} className="text-[#D4A853]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4A853]">
                  Limited Time Offer
                </span>
              </div>
              <h3 className="text-lg font-extrabold tracking-tight text-white sm:text-xl">
                {banner.title}
              </h3>
              {banner.description && (
                <p className="mt-0.5 text-xs text-white/50 sm:text-sm">{banner.description}</p>
              )}
            </div>
          </div>

          {/* Center: scrolling product images */}
          {products.length > 0 && (
            <div className="relative w-full max-w-md flex-1 px-6 sm:mx-4 sm:w-auto sm:px-0">
              <div
                ref={scrollRef}
                className="flex gap-2 overflow-x-auto py-1 scrollbar-hide"
              >
                {[...products, ...products].map((product, i) => (
                  <Link
                    key={`${product._id}-${i}`}
                    to={`/products/${product.slug || product._id}`}
                    className="group/item flex-shrink-0"
                  >
                    <div className="h-14 w-14 overflow-hidden rounded-xl ring-1 ring-white/10 transition group-hover/item:ring-[#D4A853]/60 sm:h-16 sm:w-16">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover/item:scale-110"
                      />
                    </div>
                  </Link>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-[#3B2314] to-transparent sm:w-6" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-[#3B2314] to-transparent sm:w-6" />
            </div>
          )}

          {/* Right: discount badge + CTA */}
          <div className="flex items-center gap-4">
            <div className="relative flex flex-col items-center">
              <motion.div
                className="absolute -inset-2 rounded-xl bg-[#8B6914]/25 blur-lg"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative flex flex-col items-center rounded-xl bg-gradient-to-br from-[#D4A853] to-[#8B6914] px-4 py-2 shadow-lg shadow-[#8B6914]/30">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-black leading-none text-white sm:text-3xl">
                    {banner.discountPercentage}
                  </span>
                  <span className="text-xs font-bold text-white/90">%</span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/80">
                  OFF
                </span>
              </div>
            </div>

            <Link
              to={banner.link || "/products"}
              className="group/btn flex items-center gap-1.5 rounded-full bg-[#D4A853] px-4 py-2 text-xs font-bold text-[#3B2314] shadow-md transition hover:bg-[#8B6914] hover:text-white hover:shadow-lg hover:shadow-[#8B6914]/25 sm:px-5 sm:py-2.5 sm:text-sm"
            >
              <Zap size={14} className="text-[#3B2314]/70 group-hover/btn:text-white" />
              Shop Now
              <ArrowRight size={14} className="transition group-hover/btn:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SaleBanner;
