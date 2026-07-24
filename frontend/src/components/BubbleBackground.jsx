import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

const BlobBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {/* Large deep forest green blob - left */}
    <motion.div
      className="absolute -left-32 top-1/4 w-[500px] h-[500px] bg-[#1a362b]/35 dark:bg-[#1f4737]/25"
      style={{
        borderRadius: "48% 52% 55% 45% / 50% 45% 55% 50%",
        filter: "blur(60px)",
        willChange: "transform",
      }}
      animate={{
        x: [0, 20, -10, 0],
        y: [0, -15, 10, 0],
        rotate: [-8, -3, -12, -8],
      }}
      transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
    />

    {/* Large sage green blob - bottom right */}
    <motion.div
      className="absolute -bottom-20 -right-20 w-[600px] h-[500px] bg-[#3f6856]/35 dark:bg-[#3f6856]/22"
      style={{
        borderRadius: "45% 55% 50% 50% / 55% 45% 55% 45%",
        filter: "blur(70px)",
        willChange: "transform",
      }}
      animate={{
        x: [0, -15, 10, 0],
        y: [0, 12, -8, 0],
        rotate: [25, 30, 20, 25],
      }}
      transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
    />

    {/* Small warm beige sphere - top center */}
    <motion.div
      className="absolute left-1/2 top-20 w-28 h-28 -translate-x-1/2 rounded-full bg-[#d4c5b4]/45 dark:bg-[#2a2a2a]/40"
      style={{ filter: "blur(22px)", willChange: "transform" }}
      animate={{ y: [0, -10, 5, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />

    {/* Floating bubbles */}
    <BubbleCanvas />

    {/* Static decorative lines (opacity only animation) */}
    <svg
      className="absolute inset-0 w-full h-full text-[#1a362b]/20 dark:text-[#3f6856]/15"
      viewBox="0 0 1440 900"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <motion.path
        d="M0 450 C 300 200, 600 600, 900 350 C 1100 200, 1300 500, 1440 400"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path
        d="M0 550 C 250 350, 500 700, 800 450 C 1050 300, 1250 550, 1440 500"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path
        d="M100 800 C 400 600, 700 300, 1000 550 C 1200 700, 1350 400, 1440 600"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeLinecap="round"
        fill="none"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>

    {/* Subtle grain overlay */}
    <div
      className="absolute inset-0 opacity-[0.02] mix-blend-multiply dark:mix-blend-screen"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "180px 180px",
      }}
    />
  </div>
);

function BubbleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let lastTime = 0;
    const fps = 30;
    const interval = 1000 / fps;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let w = canvas.width;
    let h = canvas.height;

    const bubbles = Array.from({ length: 40 }, () => ({
      x: Math.random() * w,
      y: h + Math.random() * 100,
      r: Math.random() * 14 + 5,
      speed: Math.random() * 0.3 + 0.15,
      wobble: Math.random() * 0.5 + 0.2,
      phase: Math.random() * Math.PI * 2,
    }));

    const draw = (time) => {
      if (time - lastTime < interval) {
        animId = requestAnimationFrame(draw);
        return;
      }
      lastTime = time;

      w = canvas.width;
      h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const dark = document.documentElement.classList.contains("dark");

      bubbles.forEach((b) => {
        b.y -= b.speed;
        b.x += Math.sin(b.phase) * b.wobble;
        b.phase += 0.01;

        if (b.y + b.r < 0) {
          b.y = h + b.r;
          b.x = Math.random() * w;
        }

        const alpha = dark ? 0.3 : 0.25;
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        grad.addColorStop(0, dark ? `rgba(100,140,120,${alpha})` : `rgba(26,54,43,${alpha})`);
        grad.addColorStop(0.5, dark ? `rgba(100,140,120,${alpha * 0.5})` : `rgba(26,54,43,${alpha * 0.5})`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

export default BlobBackground;
