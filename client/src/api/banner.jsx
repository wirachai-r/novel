import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 📌 อ่าน Banner ทั้งหมด พร้อม pagination
export const readAllBanner = async (page = 1, limit = 10) => {
  return await api.get(`/banner/read.php?page=${page}&limit=${limit}`);
};

export const readAllBannerHome = async (page = 1, limit = 10) => {
  return await api.get(`/banner/read_home.php?page=${page}&limit=${limit}`);
};

// 📌 อ่าน Banner ตาม ID
export const readOneBanner = async (bannerId) => {
  return await api.get(`/banner/read_one.php?banner_id=${bannerId}`);
};

// 📌 สร้าง Banner ใหม่
export const createBanner = async (bannerData) => {
  return await api.post("/banner/create.php", bannerData);
};

// 📌 อัปเดต Banner
export const updateBanner = async (bannerData) => {
  return await api.post("/banner/update.php", bannerData);
};

// 📌 ลบ Banner
export const deleteBanner = async (bannerId) => {
  return await api.post("/banner/delete.php", { banner_id: bannerId });
};

// 📌 อัปโหลดรูป Banner (ใช้ form-data)
export const uploadBannerImage = async (file, old_url = null) => {
  const formData = new FormData();
  formData.append("file", file);
  if (old_url) {
    formData.append("old_url", old_url);
  }

  return await api.post("/banner/upload.php", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
