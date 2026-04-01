import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const readAllUser = async (page = 1, limit = 10) => {
  return await api.get(`/user/read.php?page=${page}&limit=${limit}`);
};

export const updateUserStatus = async (user_id, status) => {
  const res = await api.put(`/user/update_status.php`, { user_id, status });
  return res.data;
};

export const updateUserRole = async (user_id, role) => {
  const res = await api.put(`/user/update_role.php`, { user_id, role });
  return res.data;
};

export const readAllNovel = async (page = 1, limit = 10) => {
  return await api.get(`/novel/read.php?page=${page}&limit=${limit}`);
};

export const updateNovelStatus = async (novel_id, status) => {
  return await api.post("/novel/update_status.php", { novel_id, status });
};

export const readUserNovelCategory = async () => {
  return await api.get(`/admin/read_counts.php`); // ใช้ API ใหม่
};