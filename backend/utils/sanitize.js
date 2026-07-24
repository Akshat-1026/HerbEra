const escapeHtml = (str) => {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
};

const sanitizeString = (str) => {
  if (typeof str !== "string") return str;
  return escapeHtml(str.trim());
};

const sanitizeObject = (obj, fields) => {
  if (!obj || typeof obj !== "object") return obj;
  const sanitized = { ...obj };
  for (const field of fields) {
    if (typeof sanitized[field] === "string") {
      sanitized[field] = sanitizeString(sanitized[field]);
    }
  }
  return sanitized;
};

const escapeRegex = (str) => {
  if (typeof str !== "string") return str;
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export { escapeHtml, sanitizeString, sanitizeObject, escapeRegex };
