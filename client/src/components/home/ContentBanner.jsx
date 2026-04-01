"use client";

import { useEffect, useState } from "react";
import { readAllBannerHome } from "@/api/banner";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Autoplay, Navigation } from "swiper/modules";

const ContentBanner = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    handleGetBanner();
  }, []);

  const handleGetBanner = () => {
    readAllBannerHome()
      .then((res) => setData(res.data.records))
      .catch((err) => console.log(err));
  };

  return (
    <div className="relative">
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{ delay: 8000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="mySwiper lg:h-160 object-cover object-center rounded-md"
      >
        {data?.map((item, index) => (
          <SwiperSlide key={index}>
            <img
              src={`${import.meta.env.VITE_UPLOAD_BASE}/${item.image_url}`}
              className="w-full object-cover rounded-md"
              alt={item.title}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* CSS Tailwind + Custom Swiper */}
      <style jsx="true">{`
        /* ปุ่ม navigation */
        .swiper-button-next,
        .swiper-button-prev {
          color: #000; /* สีไอคอนดำ */
          background: #e5e7eb; /* bg-gray-200 */
          width: 60px;
          height: 60px;
          border-radius: 50%; /* ทำให้เป็นวงกลม */
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s ease;
        }

        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background: #d1d5db; /* bg-gray-300 เมื่อ hover */
        }

        /* Bullet active สีดำ */
        .swiper-pagination-bullet-active {
          background: #000;
        }
      `}</style>
    </div>
  );
};

export default ContentBanner;
