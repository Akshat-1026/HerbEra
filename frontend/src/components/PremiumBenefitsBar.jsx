import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const PremiumBenefitsBar = () => {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let mounted = true;
    axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/settings`)
      .then((res) => {
        if (mounted && res.data.benefits_bar) {
          setItems(res.data.benefits_bar);
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  if (!items || !items.length) return null;

  return (
    <section className="relative z-10 w-full overflow-hidden bg-[#0D1210]">
      <motion.div
        className="flex items-center gap-12 py-2"
        initial={{ x: 0 }}
        animate={{ x: "-50%" }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {[...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-base">{item.icon}</span>
            <span className="text-xs font-medium text-white/90">
              {item.text}
            </span>
          </div>
        ))}
      </motion.div>
    </section>
  );
};

export default PremiumBenefitsBar;
