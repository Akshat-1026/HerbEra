import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { translateProduct } from "../utils/translateProduct";

export default function useProductTranslation(product) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] || "en";
  const [translated, setTranslated] = useState(product);

  useEffect(() => {
    if (!product) return;
    if (lang === "en") {
      setTranslated(product);
      return;
    }

    let cancelled = false;
    translateProduct(product, lang).then((result) => {
      if (!cancelled) setTranslated(result);
    });

    return () => { cancelled = true; };
  }, [product, lang]);

  return translated;
}
