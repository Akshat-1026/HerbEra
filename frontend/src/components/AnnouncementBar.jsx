import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

function AnnouncementBar() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/settings`)
      .then((res) => {
        if (mounted && res.data.announcement_bar) {
          setData(res.data.announcement_bar);
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  return (
    <div className="relative z-10 h-[48px] w-full overflow-hidden bg-[#0D1210] sm:h-[52px] lg:h-[56px]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute left-1/4 top-1/3 h-24 w-24 rounded-full bg-[#5F8F63]/10 blur-3xl"
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute right-1/3 top-1/4 h-32 w-32 rounded-full bg-[#82C784]/10 blur-3xl"
          animate={{ x: [0, -25, 15, 0], y: [0, 15, -25, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 h-20 w-20 rounded-full bg-[#5F8F63]/8 blur-3xl"
          animate={{ x: [0, 20, -15, 0], y: [0, -15, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute right-1/4 top-1/2 h-16 w-16 rounded-full bg-white/5 blur-2xl"
          animate={{ x: [0, -15, 10, 0], y: [0, 10, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute left-1/2 top-1/4 h-1 w-1 rounded-full bg-white/20 blur-sm"
          animate={{ opacity: [0, 0.8, 0], scale: [1, 1.5, 1] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="absolute right-1/4 bottom-1/3 h-1 w-1 rounded-full bg-[#82C784]/30 blur-sm"
          animate={{ opacity: [0, 0.6, 0], scale: [1, 1.8, 1] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />
        <motion.div
          className="absolute left-1/3 bottom-1/4 h-1.5 w-1.5 rounded-full bg-white/15 blur-sm"
          animate={{ opacity: [0, 0.5, 0], scale: [1, 1.6, 1] }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.015] to-transparent" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear", delay: 1 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1210]/40 via-transparent to-[#0D1210]/40" />
      </div>

      <div className="relative z-10 flex h-full flex-row items-center justify-center gap-4 px-5 text-center">
        <h2 className="text-[13px] font-bold tracking-[0.2px] text-white lg:text-[14px]">
          {data?.title}
        </h2>
        <p className="text-[12px] font-medium leading-[1.4] text-white/88 lg:text-[13px]">
          {data?.description}
        </p>
      </div>
    </div>
  );
}

export default AnnouncementBar;
