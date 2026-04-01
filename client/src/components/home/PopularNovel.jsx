import { useEffect, useState } from "react";
import { readMax } from "@/api/novel"; // หรือ endpoint API ของคุณ
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import NovelCard from "../NovelCard";

const PopularNovel = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        handleGetPopular();
    }, []);

    const handleGetPopular = async () => {
        try {
            const res = await readMax(12, 0); // ดึง 12 นิยายยอดนิยม
            setData(res.data.records || []);
        } catch (err) {
            console.error("ไม่สามารถดึงนิยายยอดนิยมได้:", err);
        }
    };

    return (
        <div className="mt-5">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-4">
                นิยายยอดนิยม
            </h2>

            <Swiper
                spaceBetween={20}
                slidesPerView={2}
                breakpoints={{
                    640: { slidesPerView: 2 },
                    768: { slidesPerView: 4 },
                    1024: { slidesPerView: 6 },
                }}
                navigation={true} // เปิดปุ่ม prev/next
                modules={[Navigation]}
                className="mySwiper"
            >
                {data.map((item, index) => (
                    <SwiperSlide key={index}>
                        <NovelCard item={item} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default PopularNovel;
