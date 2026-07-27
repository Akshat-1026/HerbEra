import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useCurrency } from "../context/CurrencyContext";

function FeaturedProducts() {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/products`).then(({ data }) => {
      setProducts(data.slice(0, 4));
    }).catch(() => {});
  }, []);

  return (
    <section className="py-20 bg-[#06142b]">
      <h2 className="text-4xl font-bold text-center text-white mb-10">
        {t("featuredProducts.heading")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-10">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-[#0b1d39] p-6 rounded-xl text-white"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-52 object-cover rounded-lg"
            />

            <h3 className="text-2xl mt-4">
              {product.name}
            </h3>

            <p className="text-green-400 text-xl">
              {formatPrice(product.price)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturedProducts;