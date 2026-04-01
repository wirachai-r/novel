import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ตัวอย่าง: http://localhost/novel/server/api
  headers: { "Content-Type": "application/json" },
});

// อ่าน comment ตาม novel_id (และ optional chapter_number)
export const readComments = (novel_id, chapter_number = null) => {
  return api.get("/comment/read.php", {
    params: { novel_id, chapter_number },
  });
};

export const createComment = (commentData) => {
  // console.log("Sending commentData:", commentData); // <-- debug
  return api.post("/comment/create.php", commentData);
};

// ลบ comment
export const deleteComment = (comment_id) => {
  return api.post("/comment/delete.php", { comment_id });
};