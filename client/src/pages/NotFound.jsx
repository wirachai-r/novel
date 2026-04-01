import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-9xl font-bold text-gray-800">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mt-4">
        Page Not Found
      </h2>
      <p className="text-gray-500 mt-2 text-center max-w-md">
        ขอโทษครับ ไม่พบหน้าที่คุณกำลังค้นหา อาจจะถูกลบ ย้ายไปที่อื่น
        หรือคุณพิมพ์ URL ไม่ถูกต้อง
      </p>

      <div className="mt-6">
        <Button onClick={() => navigate("/")}>กลับไปหน้าแรก</Button>
      </div>
    </div>
  );
};

export default NotFound;
