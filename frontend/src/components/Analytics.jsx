import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const GA_ID = import.meta.env.VITE_GA_ID || "";

const Analytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (!GA_ID) return;
    const win = window;
    win.dataLayer = win.dataLayer || [];
    function gtag() { win.dataLayer.push(arguments); }
    gtag("js", new Date());
    gtag("config", GA_ID, { page_path: location.pathname + location.search });
  }, [location]);

  useEffect(() => {
    if (!GA_ID || document.querySelector("#ga-script")) return;
    const script = document.createElement("script");
    script.id = "ga-script";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);
  }, []);

  return null;
};

export default Analytics;
