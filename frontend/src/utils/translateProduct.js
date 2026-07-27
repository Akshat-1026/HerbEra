const CACHE_KEY = "herbEra_product_translations";
const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

function getCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

function cacheKey(text, lang) {
  return `${lang}::${text}`;
}

export async function translateText(text, targetLang) {
  if (!text || !targetLang || targetLang === "en") return text;

  const key = cacheKey(text, targetLang);
  const cache = getCache();
  const cached = cache[key];
  if (cached && Date.now() - cached.ts < CACHE_EXPIRY_MS) {
    return cached.result;
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Translation failed");
    const data = await res.json();
    const translated = data[0].map((s) => s[0]).join("");
    cache[key] = { result: translated, ts: Date.now() };
    setCache(cache);
    return translated;
  } catch {
    return text;
  }
}

export async function translateProduct(product, targetLang) {
  if (!product || targetLang === "en") return product;

  const fields = ["name", "description", "sideEffects", "usageInstructions"];
  const arrayFields = ["benefits", "ingredients"];

  const translations = {};

  for (const field of fields) {
    if (product[field]) {
      translations[field] = await translateText(product[field], targetLang);
    }
  }

  for (const field of arrayFields) {
    if (product[field]?.length > 0) {
      translations[field] = await Promise.all(
        product[field].map((item) => translateText(item, targetLang))
      );
    }
  }

  return { ...product, ...translations };
}
