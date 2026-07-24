import api from "../services/api";

const newsletterApi = {
  subscribe: async (email) => {
    const res = await api.post("/newsletter/subscribe", { email });
    return res.data;
  },
  unsubscribe: async (email) => {
    const res = await api.post("/newsletter/unsubscribe", { email });
    return res.data;
  },
};

export default newsletterApi;
