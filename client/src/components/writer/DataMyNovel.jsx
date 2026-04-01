import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Eye, List } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

import { readAllCategory } from "@/api/category";
import { readNovelsByUser, createNovel, uploadCoverImage } from "@/api/novel";
import useAuthStore from "@/store/novel-store";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useNavigate } from "react-router-dom";

const DataMyNovel = () => {
  const { user, checkAuth, token } = useAuthStore();

  useEffect(() => {
    if (token) {
      checkAuth();
    }
  }, [token, checkAuth]);

  const [novels, setNovels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    author_name: "",
    translator_name: "",
    description: "",
    status: "draft",
    coverImage: null,
    previewImage: "",
  });
  const [creating, setCreating] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
    loadNovels();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await readAllCategory(1, 100);
      if (res.data.records) setCategories(res.data.records);
    } catch (err) {
      toast.error("ไม่สามารถโหลดหมวดหมู่ได้");
      console.error(err);
    }
  };

  const loadNovels = async () => {
    if (!user) return;
    try {
      const res = await readNovelsByUser(user.user_id, 1, 100);
      if (res.data.records) setNovels(res.data.records);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateNovel = async () => {
    if (!user) return toast.warn("กรุณาเข้าสู่ระบบก่อน");

    if (selectedCategories.length === 0) {
      toast.warn("กรุณาเลือกหมวดหมู่อย่างน้อย 1 หมวด");
      return;
    }

    setCreating(true);

    let imageUrl = "";
    if (form.coverImage) {
      try {
        const formData = new FormData();
        formData.append("file", form.coverImage);
        const res = await uploadCoverImage(formData);
        imageUrl = res.data?.url || "";
      } catch (err) {
        toast.error("ไม่สามารถอัปโหลดภาพปกได้");
        setCreating(false);
        return;
      }
    }

    const payload = {
      user_id: user.user_id,
      title: form.title,
      author_name: form.author_name || null,
      translator_name: form.translator_name || null,
      description: form.description,
      cover_image_url: imageUrl,
      status: form.status,
      view_count: 0,
      categories: selectedCategories.map((c) => c.category_id),
    };

    try {
      const res = await createNovel(payload);
      loadNovels();

      // เคลียร์ฟอร์ม
      setForm({
        title: "",
        author_name: "",
        translator_name: "",
        description: "",
        status: "draft",
        coverImage: null,
        previewImage: "",
      });
      setSelectedCategories([]);

      // ปิด Dialog หลังเพิ่มข้อมูล
      setDialogOpen(false);

      toast.success("สร้างนิยายเรียบร้อยแล้ว!");
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการสร้างนิยาย");
    } finally {
      setCreating(false);
    }
  };

    const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    let value, unit;

    if (diffInSeconds < 60) {
      value = -diffInSeconds;
      unit = "second";
    } else if (diffInSeconds < 3600) {
      value = -Math.floor(diffInSeconds / 60);
      unit = "minute";
    } else if (diffInSeconds < 86400) {
      value = -Math.floor(diffInSeconds / 3600);
      unit = "hour";
    } else {
      value = -Math.floor(diffInSeconds / 86400);
      unit = "day";
    }

    return new Intl.RelativeTimeFormat("th-TH", { numeric: "auto" }).format(value, unit);
  };

  return (
    <div className="w-full">

      {/* Add Novel */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <div
            className="flex flex-row items-center justify-center space-x-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100 transition px-4 py-3"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-6 w-6 text-gray-500" />
            <span className="text-gray-600 font-medium">เพิ่มนิยาย</span>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[900px] w-full max-h-[90vh] overflow-y-auto p-4 bg-white rounded-lg shadow-lg animate-fade-in"
          style={{
            animationDuration: "0.2s",
            animationFillMode: "forwards",
          }}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">เพิ่มนิยายใหม่</DialogTitle>
            <DialogDescription>กรอกข้อมูลนิยายใหม่ของคุณที่นี่</DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateNovel();
            }}
          >
            <div className="flex flex-col sm:flex-row gap-4 py-2">
              {/* Left: File + Preview */}
              <div className="w-full sm:w-1/3 flex flex-col items-center">
                <label className="block mb-1 font-medium text-sm">ภาพปก</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setForm({
                      ...form,
                      coverImage: file,
                      previewImage: URL.createObjectURL(file),
                    });
                  }}
                />
                {form.previewImage && (
                  <img
                    src={form.previewImage}
                    alt="Preview"
                    className="mt-3 relative overflow-hidden rounded-xl flex items-center justify-center bg-gray-200 aspect-[3/4]"
                  />
                )}
              </div>

              {/* Right: Form */}
              <div className="w-full sm:w-2/3 space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">ชื่อเรื่อง</label>
                  <Input
                    placeholder="กรอกชื่อเรื่อง"
                    value={form.title}
                    required
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">ชื่อผู้แต่ง</label>
                  <Input
                    placeholder="กรอกชื่อผู้แต่ง"
                    value={form.author_name}
                    onChange={(e) =>
                      setForm({ ...form, author_name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">ชื่อผู้แปล</label>
                  <Input
                    placeholder="กรอกชื่อผู้แปล"
                    value={form.translator_name}
                    onChange={(e) =>
                      setForm({ ...form, translator_name: e.target.value })
                    }
                  />
                </div>

                {/* Categories multi-select */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    หมวดหมู่
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full text-left">
                        {selectedCategories.length
                          ? selectedCategories.map((c) => c.name).join(", ")
                          : "เลือกหมวดหมู่"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-60 max-h-48 overflow-y-auto">
                      <DropdownMenuLabel>หมวดหมู่</DropdownMenuLabel>
                      {categories.map((cat) => (
                        <DropdownMenuCheckboxItem
                          key={cat.category_id}
                          checked={selectedCategories.some(
                            (c) => c.category_id === cat.category_id
                          )}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories((prev) => [...prev, cat]);
                            } else {
                              setSelectedCategories((prev) =>
                                prev.filter(
                                  (c) => c.category_id !== cat.category_id
                                )
                              );
                            }
                          }}
                        >
                          {cat.name}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    รายละเอียด
                  </label>
                  <Textarea
                    placeholder="กรอกรายละเอียดนิยาย"
                    value={form.description}
                    required
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="h-32"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">สถานะ</label>
                  <Select
                    value={form.status}
                    required
                    onValueChange={(value) =>
                      setForm({ ...form, status: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="เลือกสถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">แบบร่าง</SelectItem>
                      <SelectItem value="ongoing">กำลังดำเนินการ</SelectItem>
                      <SelectItem value="completed">จบแล้ว</SelectItem>
                      <SelectItem value="paused">หยุดชั่วคราว</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">ยกเลิก</Button>
              </DialogClose>
              <Button type="submit" disabled={creating}>
                {creating ? "กำลังเพิ่ม..." : "เพิ่ม"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:grid-cols-6 xl:gap-x-8 mt-5">
        {/* Display novels */}
        {novels.map((novel) => (
          <div
            key={novel.novel_id ?? novel.id}
            className="transition cursor-pointer"
            onClick={() => navigate(`${novel.novel_id ?? novel.id}`)}
          >
            <div className="relative overflow-hidden rounded-xl flex items-center justify-center bg-gray-200 aspect-[3/4]">
              {novel.cover_image_url ? (
                <img
                  src={
                    novel.cover_image_url.startsWith("http")
                      ? novel.cover_image_url
                      : `${import.meta.env.VITE_UPLOAD_BASE}/${novel.cover_image_url}`
                  }
                  alt={novel.title || "No Title"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-500 font-semibold">No Image</span>
              )}
            </div>

            <div className="p-1">
              <h3 className="text-xs font-bold truncate">{novel.title || "ไม่มีชื่อเรื่อง"}</h3>
              <div className="flex items-center justify-between mt-1 text-xs text-gray-600">
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{novel.view_count?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-500">
                  <span>{timeAgo(novel.updated_at)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <List className="w-3 h-3" />
                  <span>{novel.chapter_count || 0}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataMyNovel;
