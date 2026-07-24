const cache = new Map();
const MAX_CACHE_SIZE = 500;

function responseCache(ttlMs = 60000) {
  return (req, res, next) => {
    if (req.method !== "GET") return next();

    const key = `${req.originalUrl}`;
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < ttlMs) {
      res.set("X-Cache", "HIT");
      return res.status(cached.status).json(cached.body);
    }

    if (cache.size >= MAX_CACHE_SIZE) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      cache.set(key, { body, status: res.statusCode, timestamp: Date.now() });
      res.set("X-Cache", "MISS");
      return originalJson(body);
    };

    next();
  };
}

function clearCache(pattern) {
  for (const key of cache.keys()) {
    if (!pattern || key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of cache) {
    if (now - val.timestamp > 120000) cache.delete(key);
  }
}, 60000);

export { responseCache, clearCache };
