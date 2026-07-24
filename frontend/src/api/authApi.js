import API from "../services/api";

const authApi = {
  login: async (email, password) => {
    const { data } = await API.post("/auth/login", {
      email,
      password,
    });

    // 🔥 SAVE TOKEN (CRITICAL FIX)
    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    return data;
  },

  register: async (userData) => {
    const { data } = await API.post("/auth/register", userData);
    return data;
  },

  getAllUsers: async () => {
    const { data } = await API.get("/auth/users");
    return data;
  },
};

export default authApi;