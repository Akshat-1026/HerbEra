const SUPPORTED = ["en", "hi", "de", "ja", "fr", "es", "zh", "ar"];

export const detectLanguage = (req, res, next) => {
  const header = req.headers["accept-language"];
  const query = req.query.lang;

  let lang = (query || header || "en").split(",")[0].split("-")[0].trim().toLowerCase();

  if (!SUPPORTED.includes(lang)) lang = "en";

  req.lang = lang;
  next();
};
