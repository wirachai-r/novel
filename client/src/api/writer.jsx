import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

// อ่านนิยายของนักเขียน (paginated)
export const readNovelsByWriter = async (user_id, page = 1, limit = 10) => {
  return await api.get("/writer/read.php", { params: { user_id, page, limit } });
};

// นับจำนวนทั้งหมดของนิยายของนักเขียน
export const countNovelsByWriter = async (user_id) => {
  return await api.get("/writer/count.php", { params: { user_id } });
};

// อัปเดตสถานะนิยาย
export const updateNovelStatus = async (novel_id, status) => {
  return await api.post("/writer/update_status.php", { novel_id, status });
};
