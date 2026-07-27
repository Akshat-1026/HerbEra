import api from "../services/api";

const reviewApi = {
  getAll: async () => {
    const res = await api.get("/reviews");
    return res.data;
  },
  getProductReviews: async (productId, { page = 1, sort = "newest", rating = 0, limit = 10 } = {}) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit), sort });
    if (rating > 0) params.set("rating", String(rating));
    const res = await api.get(`/reviews/product/${productId}?${params}`);
    return res.data;
  },
  getStats: async (productId) => {
    const res = await api.get(`/reviews/product/${productId}/stats`);
    return res.data;
  },
  create: async (productId, data) => {
    const res = await api.post(`/reviews/product/${productId}`, data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/reviews/${id}`, data);
    return res.data;
  },
  toggleHelpful: async (id) => {
    const res = await api.post(`/reviews/${id}/helpful`);
    return res.data;
  },
  report: async (id, reason) => {
    const res = await api.post(`/reviews/${id}/report`, { reason });
    return res.data;
  },
  toggleApproval: async (id) => {
    const res = await api.put(`/reviews/${id}/approve`);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/reviews/${id}`);
    return res.data;
  },
};

export default reviewApi;
