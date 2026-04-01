import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" }, // Default สำหรับ JSON
});

export const getUserProfile = async (user_id) => {
  return await api.get(`/user/read_one.php`, { params: { user_id } });
};

export const updateUserProfile = async (user_id, data) => {
  return await api.put(`/user/update.php`, { user_id, ...data });
};

export const updateUserPassword = async (user_id, password) => {
  return await api.put(`/user/update_password.php`, { user_id, password });
};

export const updateUserRole = async (user_id, role) => {
  const res = await api.put(`/user/update_role.php`, { user_id, role });
  return res.data;
};
