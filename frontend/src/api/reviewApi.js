import api from "../services/api";

const reviewApi = {
  getAll: async () => {
    const res = await api.get("/reviews");
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/reviews/${id}`);
    return res.data;
  }
};

export default reviewApi;
