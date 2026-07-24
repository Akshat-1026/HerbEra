import api from "../services/api";

const productApi = {
  getAll: async () => {
    const res = await api.get("/products");
    return res.data;
  },
  create: async (product) => {
    const res = await api.post("/products", product);
    return res.data;
  },
  update: async (id, product) => {
    const res = await api.put(`/products/${id}`, product);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  }
};

export default productApi;
