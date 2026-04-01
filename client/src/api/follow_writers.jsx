import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

// ดึง writers ที่ user กำลัง follow
export const getFollowedWriters = async (user_id, page = 1, limit = 12) => {
  return await api.get(`/follow_writers/get_followed_writers.php`, {
    params: { user_id, page, limit },
  });
};

// Follow writer
export const followWriter = async (user_id, writer_id) => {
  return await api.post(`/follow_writers/follow.php`, { user_id, writer_id });
};

// Unfollow writer
export const unfollowWriter = async (user_id, writer_id) => {
  return await api.post(`/follow_writers/unfollow.php`, { user_id, writer_id });
};

// ตรวจสอบว่า user กำลัง follow writer หรือไม่
export const isFollowingWriter = async (user_id, writer_id) => {
  return await api.get(`/follow_writers/is_following.php`, {
    params: { user_id, writer_id },
  });
};
