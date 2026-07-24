import { useEffect } from "react";
import { useTranslation } from "react-i18next";

function SEO({ title, description, keywords, image }) {
  const { t } = useTranslation();
  useEffect(() => {
    document.title = title ? `${title} | Herb-Era` : t("seo.defaultTitle");
    const setMeta = (name, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
      if (!el) { el = document.createElement("meta"); if (name.startsWith("og:")) el.setAttribute("property", name); else el.setAttribute("name", name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("description", description || t("seo.defaultDescription"));
    setMeta("keywords", keywords || t("seo.defaultKeywords"));
    setMeta("og:title", title ? `${title} | Herb-Era` : t("seo.defaultTitle"));
    setMeta("og:description", description);
    setMeta("og:image", image || "/images/hero-bg.jpg");
  }, [title, description, keywords, image, t]);
  return null;
}

export default SEO;
