"use client";

import { useEffect, useState } from "react";
import debounce from "lodash.debounce";

import { searchAllNovel } from "@/api/novel";
import { readAllCategory } from "@/api/category";
import NovelCard from "@/components/NovelCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const SearchNovel = () => {
  const [novels, setNovels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const limit = 36;

  // โหลดหมวดหมู่ทั้งหมด
  const fetchCategories = async () => {
    try {
      const res = await readAllCategory(1, 50);
      setCategories(res.data.records || []);
    } catch (err) {
      console.error("โหลดหมวดหมู่ไม่สำเร็จ:", err);
    }
  };

  // โหลดนิยายตาม search และ category
  const fetchNovelsBySearch = async (
    newPage = 1,
    query = searchQuery,
    category = selectedCategory
  ) => {
    setLoading(true);
    setError(null);
    try {
      const cat = category === "all" ? "" : category;
      const q = query.trim();
      const res = await searchAllNovel(newPage, limit, q, cat);
      setNovels(res.data.records || []);
      setPage(newPage);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError("โหลดนิยายไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // โหลดครั้งแรก
  useEffect(() => {
    fetchCategories();
    fetchNovelsBySearch(1);
  }, []);

  // Live search + debounce
  const debouncedSearch = debounce((query, category) => {
    fetchNovelsBySearch(1, query, category);
  });

  useEffect(() => {
    debouncedSearch(searchQuery, selectedCategory);
    return debouncedSearch.cancel;
  }, [searchQuery, selectedCategory]);

  return (
    <div>
      <h2 className="text-lg font-semibold my-4">ค้นหานิยาย</h2>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Input
          placeholder="ค้นหา..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select
          value={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="เลือกหมวดหมู่" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
            {categories.map((cat) => (
              <SelectItem
                key={cat.category_id}
                value={cat.category_id.toString()}
              >
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div>กำลังโหลด...</div>
      ) : error ? (
        <div>{error}</div>
      ) : novels.length === 0 ? (
        <p className="text-center text-gray-500 py-6">ไม่พบผลลัพธ์</p>
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
                onClick={() => fetchNovelsBySearch(page - 1)}
                disabled={page <= 1}
              >
                ก่อนหน้า
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNovelsBySearch(page + 1)}
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

export default SearchNovel;
