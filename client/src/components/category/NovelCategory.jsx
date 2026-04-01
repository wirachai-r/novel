"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readAllCategory } from "@/api/category";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

const NovelCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadCategories = async () => {
    try {
      const res = await readAllCategory(1, 50); // อ่านหมวดหมู่ 50 รายการแรก
      setCategories(res.data.records || []);
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการดึงหมวดหมู่:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  if (loading) return <p className="text-center py-6">กำลังโหลด...</p>;

  return (
    <div className="w-full space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <button
                onClick={() => navigate("/")}
                className="hover:text-gray-900 transition-colors cursor-pointer"
              >
                หน้าแรก
              </button>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <button
              onClick={() => navigate("/category")}
              className="hover:text-gray-900 transition-colors cursor-pointer"
            >
              หมวดหมู่
            </button>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {categories.length === 0 ? (
        <p className="text-gray-500 text-center">ไม่พบหมวดหมู่</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Card
              key={cat.category_id}
              onClick={() => navigate(`/category/${cat.category_id}`)}
              className="cursor-pointer hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6 text-center">
                <div>{cat.name}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NovelCategory;
