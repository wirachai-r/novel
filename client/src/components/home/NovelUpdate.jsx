import { useEffect, useState } from "react";
import { readUpdate } from "@/api/novel"; // ✅ ใช้ API novelUpdate
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import NovelCard from "../NovelCard"; // ✅ การ์ดแสดงนิยาย

const NovelUpdate = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    handleGetUpdate();
  }, []);

  const handleGetUpdate = async () => {
    try {
      const res = await readUpdate(12, 0); // ดึงนิยายล่าสุด 12 เรื่อง
      setData(res.data.records || []);
    } catch (err) {
      console.error("ไม่สามารถดึงนิยายล่าสุดได้:", err);
    }
  };

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-4">
        นิยายอัปเดตล่าสุด
      </h2>

      <Swiper
        spaceBetween={20}
        slidesPerView={2}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 6 },
        }}
        navigation={true}
        modules={[Navigation]}
        className="mySwiper"
      >
        {data.map((item, index) => (
          <SwiperSlide key={index}>
            <NovelCard item={item} /> {/* ✅ ใช้การ์ด Novel แทน Product */}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default NovelUpdate;
