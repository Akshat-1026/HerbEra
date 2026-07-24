import api from "../services/api";

const couponApi = {
  getAll: async () => {
    const res = await api.get("/coupons");
    return res.data;
  },
  create: async (coupon) => {
    const res = await api.post("/coupons", coupon);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/coupons/${id}`);
    return res.data;
  }
};

export default couponApi;
