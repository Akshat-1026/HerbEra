import api from "../services/api";

const orderApi = {
  getAll: async () => {
    const res = await api.get("/orders");
    return res.data;
  },
  updateStatus: async (id, status) => {
    const res = await api.put(`/orders/${id}/status`, { status });
    return res.data;
  }
};

export default orderApi;
