import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { readNovelByCategory } from "@/api/novel";
import { readAllCategory } from "@/api/category";
import NovelCard from "@/components/NovelCard";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const NovelCategorySearch = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [novels, setNovels] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const limit = 12;

  // ฟังก์ชันดึงหมวดหมู่ทั้งหมด
  const fetchAllCategories = async () => {
    let allCategories = [];
    let pageNum = 1;
    const perPage = 50; 
    let totalPages = 1;

    try {
      do {
        const res = await readAllCategory(pageNum, perPage);
        const cats = res.data.records || [];
        totalPages = res.data.totalPages || 1;
        allCategories = allCategories.concat(cats);
        pageNum++;
      } while (pageNum <= totalPages);
    } catch (err) {
      console.error("ไม่สามารถดึงหมวดหมู่ทั้งหมดได้:", err);
    }

    return allCategories;
  };

  // โหลด category และ novels
  useEffect(() => {
    const fetchCategoryAndNovels = async () => {
      setLoading(true);
      setError(null);
      try {
        const cats = await fetchAllCategories();
        const cat = cats.find(c => c.category_id.toString() === categoryId.toString());
        setCategoryName(cat ? cat.name : "หมวดหมู่ไม่ทราบชื่อ");

        const resNovels = await readNovelByCategory(categoryId, 1, limit);
        setNovels(resNovels.data.records || []);
        setPage(1);
        setTotalPages(resNovels.data.totalPages || 1);
      } catch (err) {
        console.error(err);
        setError("ไม่สามารถโหลดหมวดหมู่หรือเรื่องนิยายได้");
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) fetchCategoryAndNovels();
  }, [categoryId]);

  const fetchNovels = async (newPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await readNovelByCategory(categoryId, newPage, limit);
      setNovels(res.data.records || []);
      setPage(newPage);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError("ไม่สามารถโหลดนิยายได้");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-6">กำลังโหลด...</div>;
  if (error) return <div className="text-center text-red-500 py-6">{error}</div>;

  return (
    <div>
      {/* Breadcrumb */}
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
            <BreadcrumbLink asChild>
              <button
                onClick={() => navigate("/category")}
                className="hover:text-gray-900 transition-colors cursor-pointer"
              >
                หมวดหมู่
              </button>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <button
              onClick={() => navigate(`/category/${categoryId}`)}
              className="hover:text-gray-900 transition-colors cursor-pointer"
            >
              {categoryName}
            </button>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title */}
      <h2 className="text-lg font-semibold my-4">{categoryName}</h2>

      {novels.length === 0 ? (
        <p className="text-center text-gray-500 py-6">ไม่พบนิยายในหมวดหมู่นี้</p>
      ) : (
        <div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6 xl:gap-x-8 mt-5">
            {novels.map((novel, index) => (
              <NovelCard key={novel.novel_id || index} item={novel} />
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 py-4">
            <div>
              หน้า {page} จาก {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNovels(page - 1)}
                disabled={page <= 1}
              >
                ก่อนหน้า
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNovels(page + 1)}
                disabled={page >= totalPages}
              >
                ถัดไป
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NovelCategorySearch;
