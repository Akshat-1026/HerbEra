import { useEffect, useState } from "react";
import api from "../services/api";
import { useTranslation } from "react-i18next";

function ReviewSection({ productId }) {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================================
     FETCH REVIEWS FROM BACKEND
  ========================================= */
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/reviews/product/${productId}`);

        setReviews(res.data || []);
      } catch (error) {
        console.error("Failed to load reviews:", error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        {t("reviewSection.customerReviews")}
      </h2>

      {/* LOADING STATE */}
      {loading ? (
        <p className="text-gray-500 dark:text-gray-300">
          {t("reviewSection.loading")}
        </p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-300">
          {t("reviewSection.noReviews")}
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id || review.id}
              className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg shadow-sm bg-white dark:bg-gray-900"
            >
              <h3 className="font-bold text-gray-800 dark:text-white">
                {review.user?.name || t("reviewSection.anonymous")}
              </h3>

              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {review.comment}
              </p>

              {review.rating && (
                <p className="text-yellow-500 mt-1">
                  ⭐ {review.rating}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewSection;