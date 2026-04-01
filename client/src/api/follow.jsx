import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

// ดึง followers ของ user
export const getFollowedNovels = async (user_id, page = 1, limit = 12) => {
  return await api.get(`/follow/get_followed_novels.php`, {
    params: { user_id, page, limit },
  });
};

// Follow novel
export const followNovel = async (user_id, novel_id) => {
  return await api.post(`/follow/follow.php`, { user_id, novel_id });
};

// Unfollow novel
export const unfollowNovel = async (user_id, novel_id) => {
  return await api.post(`/follow/unfollow.php`, { user_id, novel_id });
};

// ตรวจสอบว่า user กำลัง follow novel หรือไม่
export const isFollowing = async (user_id, novel_id) => {
  return await api.get(`/follow/is_following.php`, {
    params: { user_id, novel_id },
  });
};
