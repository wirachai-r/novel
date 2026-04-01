import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Eye, List, MessageCircle, Plus, MoreHorizontal, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import { readNovelById, updateNovel, uploadCoverImage, deleteNovel } from "@/api/novel";
import { readAllCategory } from "@/api/category";
import { readChaptersByNovel, createChapter, readChapterByNumber, updateChapter, deleteChapter } from "@/api/chapter";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import TiptapEditor from "./TiptapEditor";

import CommentSection from "../novel/CommentSection";

import useAuthStore from "@/store/novel-store";

const DataMyNovelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, checkAuth, token } = useAuthStore();

  useEffect(() => {
    if (token) {
      checkAuth();
    }
  }, [token, checkAuth]);

  // ======= STATES =======
  const [novel, setNovel] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [form, setForm] = useState({
    categories: [],
    cover_preview: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [chapters, setChapters] = useState([]);
  const [chapterDialogOpen, setChapterDialogOpen] = useState(false);
  const [newChapter, setNewChapter] = useState({ chapter_number: 1, title: "", content: "" });
  const [creatingChapter, setCreatingChapter] = useState(false);

  // ======= LOAD NOVEL & CATEGORIES =======
  useEffect(() => {
    const loadData = async () => {
      if (!user || !user.user_id) {
        toast.error("ไม่พบผู้ใช้งาน");
        navigate("/"); // redirect กลับหน้าแรก
        return;
      }

      try {
        const resCat = await readAllCategory(1, 100);
        setAllCategories(resCat.data.records || []);

        const resNovel = await readNovelById(id);
        if (resNovel.data) {
          const data = resNovel.data;

          if (Number(data.user_id) !== Number(user.user_id)) {
            navigate("/writer/mynovel");
            return;
          }

          setNovel(data);
          setForm({
            id: data.novel_id || "",
            title: data.title || "",
            author_name: data.author_name || "",
            translator_name: data.translator_name || "",
            description: data.description || "",
            status: data.status || "draft",
            cover_image_url: data.cover_image_url || "",
            categories: (data.categories || []).map(c => Number(c.category_id)),
            cover_preview: "",
            comment_count: data.comment_count || 0,
            like_count: data.like_count || 0,
          });
        }
      } catch (err) {
        navigate("/writer/mynovel");
      }
    };

    if (id) loadData();
  }, [id, user]);


  // ======= LOAD CHAPTERS =======
  useEffect(() => {
    const loadChapters = async () => {
      try {
        const res = await readChaptersByNovel(Number(id));
        setChapters(res.data.records || []);
      } catch (err) {
        if (err.response?.status === 404) {
          setChapters([]);
        }
      }
    };

    if (id) loadChapters();
  }, [id]);

  // ======= HANDLERS =======
  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm(prev => ({ ...prev, cover_preview: URL.createObjectURL(file) }));
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("old_url", form.cover_image_url || "");

      const res = await uploadCoverImage(formData);
      if (res.data?.url) {
        setForm(prev => ({
          ...prev,
          cover_image_url: res.data.url,
          cover_preview: "",
        }));
      } else {
        toast.warning("อัปโหลดสำเร็จ แต่ไม่พบ URL");
      }
    } catch (err) {
      // console.error(err);
      toast.error("อัปโหลดปกล้มเหลว");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.description || !form.status) {
      toast.warn("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    setSaving(true);
    try {
      await updateNovel({ novel_id: id, ...form });
      setNovel(prev => ({ ...prev, ...form }));
      toast.success("บันทึกเรียบร้อยแล้ว!");
    } catch (err) {
      // console.error(err);
      toast.error("บันทึกล้มเหลว");
    } finally {
      setSaving(false);
    }
  };

  const [page, setPage] = useState(1);
  const pageSize = 50; // ✅ จำนวน chapter ต่อหน้า
  const totalPages = Math.ceil(chapters.length / pageSize);

  const handleCreateChapter = async () => {
    if (!newChapter.title || !newChapter.content) {
      toast.warn("กรุณากรอกข้อมูลทั้งหมด");
      return;
    }
    setCreatingChapter(true);
    try {
      // หาเลข chapter ล่าสุด
      const nextChapterNumber =
        chapters.length > 0
          ? Math.max(...chapters.map(ch => Number(ch.chapter_number || 0))) + 1
          : 1;

      await createChapter({
        novel_id: Number(id), // ✅ แก้ให้ส่งเป็น number
        chapter_number: nextChapterNumber,
        title: newChapter.title,
        content: newChapter.content,
      });


      toast.success("สร้างตอนใหม่เรียบร้อยแล้ว!");
      setNewChapter({ chapter_number: nextChapterNumber + 1, title: "", content: "" });
      setChapterDialogOpen(false);

      refreshNovel();

      // reload chapters

    } catch (err) {
      // console.error(err);
      toast.error(err.response?.data?.message || "สร้างตอนล้มเหลว");
    } finally {
      setCreatingChapter(false);
    }
  };

  // ======= เพิ่ม States =======
  const [viewEditDialogOpen, setViewEditDialogOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [updatingChapter, setUpdatingChapter] = useState(false);

  // ======= HANDLER VIEW/EDIT =======
  const handleViewEditChapter = async (ch) => {
    try {
      const res = await readChapterByNumber(Number(id), Number(ch.chapter_number));
      setSelectedChapter(res.data);
      setViewEditDialogOpen(true);
    } catch (err) {
      // console.error(err);
      toast.error("โหลดข้อมูลตอนล้มเหลว");
    }
  };


  const handleUpdateChapter = async () => {
    if (!selectedChapter.title || !selectedChapter.content) {
      toast.warn("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    setUpdatingChapter(true);
    try {
      await updateChapter({
        novel_id: Number(id),
        chapter_number: Number(selectedChapter.chapter_number),
        title: selectedChapter.title,
        content: selectedChapter.content,
      });

      toast.success("อัปเดตตอนเรียบร้อยแล้ว!");
      setViewEditDialogOpen(false);

      refreshNovel();

      // reload chapters
    } catch (err) {
      // console.error(err);
      toast.error("อัปเดตตอนล้มเหลว");
    } finally {
      setUpdatingChapter(false);
    }
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedChapterToDelete, setSelectedChapterToDelete] = useState(null);
  const [deletingChapter, setDeletingChapter] = useState(false);

  const handleConfirmDelete = async () => {
    if (!selectedChapterToDelete) return;

    setDeletingChapter(true);
    try {
      await deleteChapter(Number(id), Number(selectedChapterToDelete.chapter_number));
      toast.success("ลบตอนเรียบร้อยแล้ว!");

      setDeleteDialogOpen(false);
      setSelectedChapterToDelete(null);

      refreshNovel();

      // reload chapters

    } catch (err) {
      // console.error(err);
      // toast.error(err.response?.data?.message || "ลบตอนล้มเหลว");
    } finally {
      setDeletingChapter(false);
    }
  };

  // ======= State สำหรับ Dialog ลบนิยาย =======
  const [alertOpen, setAlertOpen] = useState(false);
  const [deletingNovel, setDeletingNovel] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0);

  // ======= ฟังก์ชันลบนิยาย =======
  const handleConfirmDeleteNovel = async () => {
    if (!novel) return;

    setDeletingNovel(true);
    try {
      await deleteNovel(novel.novel_id);
      toast.success("ลบนิยายเรียบร้อยแล้ว!");
      navigate("/writer/mynovel");
    } catch (err) {
      toast.error(err.response?.data?.message || "ลบนิยายล้มเหลว");
    } finally {
      setDeletingNovel(false);
      setAlertOpen(false);
      setDeleteStep(0); // reset step
    }
  };

  const [commentDialogOpen, setCommentDialogOpen] = useState(false);

  const refreshNovel = async () => {
    try {
      // โหลดข้อมูลนิยาย
      const res = await readNovelById(id);
      setNovel(res.data);

      // โหลด chapters แบบไม่ error ถ้า 404
      try {
        const resChapters = await readChaptersByNovel(Number(id));
        setChapters(resChapters.data.records || []);
        // console.log(resChapters.data.records);
      } catch (err) {
        // ถ้า 404 หรือ error ให้ ignore เงียบ ๆ
        setChapters([]);
        // console.warn("ไม่พบตอนหรือโหลดล้มเหลว:", err.message);
      }

    } catch (err) {
      // console.error("โหลดนิยายล้มเหลว:", err);
    }
  };

  // ======= RENDER =======
  return (
    <div className="w-full">
      {!novel ? (
        <p className="text-center mt-8">กำลังโหลด...</p>
      ) : (
        <>
          {/* Breadcrumb */}
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <button onClick={() => navigate("/writer/mynovel")} className="hover:text-gray-900 transition-colors">
                    นิยายของฉัน
                  </button>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span>{novel.title || "นิยายไม่มีชื่อ"}</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* NOVEL DETAIL */}
          <Card className="overflow-hidden rounded-xl p-6 flex flex-col md:flex-row gap-6">
            {/* Cover */}
            <div className="w-full sm:w-1/3 flex flex-col items-center">
              <label className="block mb-1 font-medium text-sm">ปกนิยาย</label>
              <Button asChild className="w-full text-center" variant="default">
                <label className="cursor-pointer w-full">
                  {form.cover_image_url ? "เปลี่ยนปกนิยาย" : "อัปโหลดปก"}
                  <Input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                </label>
              </Button>
              {(form.cover_preview || form.cover_image_url) && (
                <div className="w-full sm:pr-4">
                  <div className="relative overflow-hidden rounded-xl flex items-center justify-center bg-gray-200 aspect-[3/4] h-full border-1 mt-5">
                    <img
                      src={
                        form.cover_preview
                          ? form.cover_preview
                          : form.cover_image_url.startsWith("http")
                            ? form.cover_image_url
                            : `${import.meta.env.VITE_UPLOAD_BASE}/${form.cover_image_url}`
                      }
                      alt="Preview"
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                </div>
              )}
              {uploading && <span className="mt-2 text-sm text-gray-500">กำลังอัปโหลด...</span>}
            </div>

            {/* Form */}
            <div className="flex-1 flex flex-col gap-4">
              <InputField label="ชื่อเรื่อง" value={form.title} onChange={val => setForm({ ...form, title: val })} />
              <InputField label="ชื่อผู้แต่ง" value={form.author_name} onChange={val => setForm({ ...form, author_name: val })} />
              <InputField label="ชื่อผู้แปล" value={form.translator_name} onChange={val => setForm({ ...form, translator_name: val })} />

              <div>
                <label className="block text-sm font-medium mb-1">คำอธิบาย</label>
                <Textarea value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full h-32" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">สถานะ</label>
                <Select value={form.status || "draft"} onValueChange={value => setForm({ ...form, status: value })}>
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

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium mb-1">หมวดหมู่</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full text-left">
                      {form.categories.length
                        ? form.categories.map(id => allCategories.find(c => Number(c.category_id) === Number(id))?.name)
                          .filter(Boolean)
                          .join(", ")
                        : "เลือกหมวดหมู่"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-60 max-h-48 overflow-y-auto">
                    <DropdownMenuLabel>หมวดหมู่</DropdownMenuLabel>
                    {allCategories.map(cat => (
                      <DropdownMenuCheckboxItem
                        key={cat.category_id}
                        checked={form.categories.includes(Number(cat.category_id))}
                        onCheckedChange={checked => setForm(prev => ({
                          ...prev,
                          categories: checked
                            ? [...prev.categories, Number(cat.category_id)]
                            : prev.categories.filter(id => id !== Number(cat.category_id)),
                        }))}
                      >
                        {cat.name}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mt-4 text-gray-600 text-sm">
                <Stat icon={<Eye className="w-5 h-5" />} label={novel.view_count || 0} />
                <Stat icon={<List className="w-5 h-5" />} label={novel.chapter_count || 0} />
                <Stat icon={<MessageCircle className="w-5 h-5" />} label={novel.comment_count || 0} />
                <Stat
                  icon={<Heart className={`w-5 h-5`} />}
                  label={novel.like_count || 0}
                />
              </div>

              <Button onClick={handleSave} disabled={saving || uploading} className="mt-4 w-full">
                {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
              </Button>
            </div>
          </Card>

          {/* Chapters */}
          {/* Chapters Table */}
          <Card className="overflow-hidden rounded-xl p-6 flex flex-col gap-4 mt-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">ตอนทั้งหมด ({novel.chapter_count || 0})</h3>
              <Dialog open={chapterDialogOpen} onOpenChange={setChapterDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Plus className="w-4 h-4" /> เพิ่มตอน
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[900px] w-full max-h-[90vh] overflow-y-auto p-4 bg-white rounded-lg shadow-lg animate-fade-in"
                  style={{
                    animationDuration: "0.2s",
                    animationFillMode: "forwards",
                  }}>
                  <DialogHeader>
                    <DialogTitle>เพิ่มตอนใหม่</DialogTitle>
                    <DialogDescription>กรอกข้อมูล chapter ใหม่</DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-2 mt-2">
                    <label className="block text-sm font-medium mb-1">ชื่อตอน</label>
                    <Input
                      placeholder="กรอกชื่อตอน"
                      value={newChapter.title}
                      onChange={e => setNewChapter(prev => ({ ...prev, title: e.target.value }))}
                    />
                    <label className="block text-sm font-medium mb-1">รายละเอียด</label>
                    <TiptapEditor
                      value={newChapter.content || ""}
                      onChange={html => setNewChapter(prev => ({ ...prev, content: html }))}
                      className="h-32"
                    />
                  </div>
                  <DialogFooter className="mt-4 flex justify-end gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">ยกเลิก</Button>
                    </DialogClose>
                    <Button onClick={handleCreateChapter} disabled={creatingChapter}>
                      {creatingChapter ? "กำลังเพิ่ม..." : "เพิ่ม"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-md border shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="px-4 py-2">#</TableHead>
                    <TableHead className="px-4 py-2">ชื่อตอน</TableHead>
                    <TableHead className="px-4 py-2">สร้างเมื่อ</TableHead>
                    <TableHead className="px-4 py-2">แก้ไขเมื่อ</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {chapters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">ยังไม่มีตอน</TableCell>
                    </TableRow>
                  ) : (
                    chapters.map((ch, idx) => (
                      <TableRow key={ch.chapter_number || idx} className="hover:bg-muted/20">
                        <TableCell className="px-4 py-2">{idx + 1}</TableCell>
                        <TableCell className="px-4 py-2">{ch.title}</TableCell>
                        <TableCell className="px-4 py-2">
                          {new Intl.DateTimeFormat("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(new Date(ch.created_at))} น.
                        </TableCell>
                        <TableCell className="px-4 py-2">
                          {new Intl.DateTimeFormat("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(new Date(ch.updated_at))} น.
                        </TableCell>
                        {/* <TableCell className="px-4 py-2">{ch.created_at ? new Date(ch.created_at).toLocaleDateString() : "-"}</TableCell>
                        <TableCell className="px-4 py-2">{ch.updated_at ? new Date(ch.updated_at).toLocaleDateString() : "-"}</TableCell> */}
                        <TableCell className="px-4 py-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm"><MoreHorizontal /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuLabel className={"font-bold"}>ตัวเลือก</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewEditChapter(ch)}>แก้ไข</DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  // ตัวอย่าง: เปิด dialog comment ของ chapter นี้
                                  setSelectedChapter(ch);        // เก็บ chapter ที่เลือก
                                  setCommentDialogOpen(true);    // เปิด dialog comment (ต้องสร้าง state)
                                }}
                              >
                                ความคิดเห็น
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedChapterToDelete(ch);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                ลบ
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <Dialog open={viewEditDialogOpen} onOpenChange={setViewEditDialogOpen}>
              <DialogContent className="sm:max-w-[900px] w-full max-h-[90vh] overflow-y-auto p-4 bg-white rounded-lg shadow-lg animate-fade-in"
                style={{
                  animationDuration: "0.2s",
                  animationFillMode: "forwards",
                }}>
                <DialogHeader>
                  <DialogTitle>แก้ไขตอน</DialogTitle>
                  <DialogDescription>แก้ไขรายละเอียดตอนด้านล่าง</DialogDescription>
                </DialogHeader>

                {selectedChapter && (
                  <div className="flex flex-col gap-2 mt-2">
                    <label className="block text-sm font-medium mb-1">ชื่อตอน</label>
                    <Input
                      placeholder="กรอกชื่อตอน"
                      value={selectedChapter.title}
                      onChange={e => setSelectedChapter(prev => ({ ...prev, title: e.target.value }))}
                    />
                    <label className="block text-sm font-medium mb-1">รายละเอียด</label>
                    <TiptapEditor
                      value={selectedChapter.content || ""}
                      onChange={html => setSelectedChapter(prev => ({ ...prev, content: html }))}
                      className="h-32"
                    />
                  </div>
                )}

                <DialogFooter className="mt-4 flex justify-end gap-2">
                  <DialogClose asChild>
                    <Button variant="outline">ยกเลิก</Button>
                  </DialogClose>
                  <Button onClick={handleUpdateChapter} disabled={updatingChapter}>
                    {updatingChapter ? "กำลังอัปเดต..." : "บันทึกการเปลี่ยนแปลง"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent className="sm:max-w-[425px] bg-white rounded-md p-4 opacity-0 animate-fade-in"
                style={{
                  animationDuration: "0.2s",
                  animationFillMode: "forwards",
                }}>
                <DialogHeader>
                  <DialogTitle>คุณแน่ใจหรือไม่?</DialogTitle>
                  <DialogDescription>
                    การดำเนินการนี้ไม่สามารถย้อนกลับได้ การกระทำนี้จะถูกลบตอนนี้อย่างถาวร
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">ยกเลิก</Button>
                  </DialogClose>
                  <Button
                    className=" bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={handleConfirmDelete}
                    disabled={deletingChapter}
                  >
                    {deletingChapter ? "กำลังลบ..." : "ลบ"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
              <DialogContent className="sm:max-w-[900px] w-full max-h-[90vh] overflow-y-auto p-4 bg-white rounded-lg shadow-lg animate-fade-in"
                style={{
                  animationDuration: "0.2s",
                  animationFillMode: "forwards",
                }}>
                <DialogHeader>
                  <DialogTitle>ความคิดเห็นสำหรับ {selectedChapter?.title}</DialogTitle>
                  <DialogDescription>จัดการความคิดเห็นสำหรับบทนี้</DialogDescription>
                </DialogHeader>

                {selectedChapter && (
                  <CommentSection novelId={novel.novel_id} chapterNumber={selectedChapter.chapter_number} />
                )}

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">ยกเลิก</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-gray-500 py-4">
              <div>
                หน้า {page} จาก {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}>
                  ก่อนหน้า
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}>
                  ถัดไป
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-6 mt-5">
            <div className="text-xl font-bold mb-0">ความคิดเห็น ({novel.comment_count || 0})</div>
            <CommentSection novelId={novel.novel_id} onCommentChange={refreshNovel} />
          </Card>

          <Card className="p-6 space-y-6 mt-5">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setAlertOpen(true)}
            >
              ลบนิยาย
            </Button>
          </Card>
          <Dialog
            open={alertOpen}
            onOpenChange={(open) => {
              setAlertOpen(open);
              if (!open) setDeleteStep(0);
            }}
          >
            <DialogContent
              className="sm:max-w-[425px] bg-white rounded-md p-4 opacity-0 animate-fade-in"
              style={{ animationDuration: "0.2s", animationFillMode: "forwards" }}
            >
              <DialogHeader>
                <DialogTitle>
                  {deleteStep === 0 && "ลบนิยาย?"}
                  {deleteStep === 1 && "ยืนยันการลบ?"}
                  {deleteStep === 2 && "ลบจริง ๆ หรือไม่?"}
                </DialogTitle>
                <DialogDescription>
                  {deleteStep === 0 && "คุณต้องการลบ “นิยาย” นี้หรือไม่?"}
                  {deleteStep === 1 && "ขั้นตอนนี้จะไม่สามารถย้อนกลับได้. โปรดยืนยันอีกครั้ง."}
                  {deleteStep === 2 && "นี่คือขั้นตอนสุดท้าย! การลบจะเกิดขึ้นทันที."}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline" onClick={() => setDeleteStep(0)}>ยกเลิก</Button>
                </DialogClose>
                {deleteStep < 2 ? (
                  <Button
                    className="bg-yellow-600 text-white hover:bg-yellow-700"
                    onClick={() => setDeleteStep(prev => prev + 1)}
                  >
                    {deleteStep === 0 ? "ถัดไป" : "ยืนยัน"}
                  </Button>
                ) : (
                  <Button
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={handleConfirmDeleteNovel}
                    disabled={deletingNovel}
                  >
                    {deletingNovel ? "กำลังลบ..." : "ลบทันที"}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </>
      )}
    </div>
  );
};

// ======= InputField =======
const InputField = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <Input value={value || ""} onChange={e => onChange(e.target.value)} />
  </div>
);

// ======= Stat =======
const Stat = ({ icon, label }) => (
  <div className="flex items-center gap-1">
    {icon} <span>{label.toLocaleString()}</span>
  </div>
);

export default DataMyNovelDetail;
