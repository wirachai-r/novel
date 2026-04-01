import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // เช่น http://localhost:3001/api
  headers: { "Content-Type": "application/json" },
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const currentUser = async () => {
  try {
    const res = await api.post("/auth/current-user");
    return res.data;
  } catch (err) {
    console.error("currentUser error:", err.response?.data || err.message);
    throw err;
  }
};

export const currentWriter = async () => {
  try {
    const res = await api.post("/auth/current-writer");
    return res.data;
  } catch (err) {
    console.error("currentWriter error:", err.response?.data || err.message);
    throw err;
  }
};

export const currentAdmin = async () => {
  try {
    const res = await api.post("/auth/current-admin");
    return res.data;
  } catch (err) {
    console.error("currentAdmin error:", err.response?.data || err.message);
    throw err;
  }
};
