import { useEffect } from "react";

const INITIAL_DELAY = 3000;
const MAX_DELAY = 60000;
const STARTUP_DELAY = 8000;

export default function useAutoRefresh() {
  useEffect(() => {
    const backendBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const url = `${backendBase}/api/events`;
    let eventSource;
    let timer;
    let delay = INITIAL_DELAY;
    let active = true;

    function connect() {
      if (!active) return;

      try {
        eventSource = new EventSource(url);
      } catch {
        retry();
        return;
      }

      eventSource.addEventListener("site-update", () => {
        if (!window.__herb_reload_pending) {
          window.__herb_reload_pending = true;
          setTimeout(() => {
            window.__herb_reload_pending = false;
            window.location.reload();
          }, 3000);
        }
      });

      eventSource.addEventListener("connected", () => {
        delay = INITIAL_DELAY;
      });

      eventSource.onerror = () => {
        eventSource.close();
        retry();
      };
    }

    function retry() {
      if (!active) return;
      delay = Math.min(delay * 2, MAX_DELAY);
      timer = setTimeout(connect, delay);
    }

    timer = setTimeout(() => { if (active) connect(); }, STARTUP_DELAY);

    return () => {
      active = false;
      clearTimeout(timer);
      if (eventSource) eventSource.close();
    };
  }, []);
}
