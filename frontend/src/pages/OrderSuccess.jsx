import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEO from "../components/SEO";

function OrderSuccess() {
  const { t } = useTranslation();
  return (

    <>
    <SEO title={t("orderSuccess.pageTitle")} />
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-6">

      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl p-10 text-center max-w-lg">

        <CheckCircle
          size={100}
          className="mx-auto text-green-600"
        />

        <h1 className="text-4xl font-bold mt-6 dark:text-white">
          {t("orderSuccess.heading")}
        </h1>

        <p className="text-zinc-600 dark:text-zinc-400 mt-4">
          {t("orderSuccess.message")}
        </p>

        <Link
          to="/products"
          className="
            inline-block
            mt-8
            bg-green-600
            hover:bg-green-700
            text-white
            px-8
            py-4
            rounded-2xl
            font-semibold
            transition
          "
        >
          {t("orderSuccess.continueShopping")}
        </Link>

      </div>
    </div>
    </>
  );
}

export default OrderSuccess;