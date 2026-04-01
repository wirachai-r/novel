import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

// กดถูกใจนิยาย
export const likeNovel = async (user_id, novel_id) => {
  return await api.post(`/like/like.php`, { user_id, novel_id });
};

// ยกเลิกถูกใจนิยาย
export const unlikeNovel = async (user_id, novel_id) => {
  return await api.post(`/like/unlike.php`, { user_id, novel_id });
};

// ตรวจสอบว่า user ถูกใจนิยายนี้หรือไม่
export const isLiked = async (user_id, novel_id) => {
  return await api.post(`/like/isLiked.php`, { user_id, novel_id });
};
