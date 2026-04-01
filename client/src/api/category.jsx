import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// อ่านหมวดหมู่ทั้งหมด พร้อม pagination
export const readAllCategory = async (page = 1, limit = 10) => {
  return await api.get(`/category/read.php?page=${page}&limit=${limit}`);
};

// สร้างหมวดหมู่ใหม่
export const createCategory = async (categoryData) => {
  return await api.post("/category/create.php", categoryData);
}

// อัปเดตหมวดหมู่
export const updateCategory = async (categoryData) => {
  return await api.post("/category/update.php", categoryData);
}

// ลบหมวดหมู่
export const deleteCategory = async (categoryId) => {
  return await api.post("/category/delete.php", { category_id: categoryId });
}
