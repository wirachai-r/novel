"use client";

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Eye, List, MessageCircle, Heart } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { readNovelById } from "@/api/novel";
import { readChaptersByNovel } from "@/api/chapter";
import { followNovel, unfollowNovel, isFollowing as checkIsFollowing } from "@/api/follow";
import { Button } from "@/components/ui/button";
import ChaptersAccordion from "./ChaptersAccordion";
import useAuthStore from "@/store/novel-store";
import CommentSection from "./CommentSection";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { likeNovel, unlikeNovel, isLiked } from "@/api/like";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { IconUser } from "@tabler/icons-react";

import { getUserProfile } from "@/api/user";

const NovelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const userId = user?.user_id;

  const [novel, setNovel] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);

  // โหลดข้อมูลนิยาย, ตอนทั้งหมด และสถานะติดตาม
  useEffect(() => {
    const loadNovel = async () => {
      try {
        const res = await readNovelById(id);
        setNovel(res.data);
        console.log(res.data);

      } catch (err) {
        console.error(err);
        // toast.error("โหลดนิยายไม่สำเร็จ");
      }
    };

    const loadChapters = async () => {
      try {
        const res = await readChaptersByNovel(id);
        setChapters(res.data.records || []);
      } catch (err) {
        // console.error(err);
        // toast.error("โหลดตอนนิยายไม่สำเร็จ");
        if (err.response?.status === 404) {
          setChapters([]);  // ← ตอนนี้จะทำให้ length = 0 → แสดง "ยังไม่มีตอน"
        }
      }
    };

    const loadFollowStatus = async () => {
      if (!userId) return;
      try {
        const res = await checkIsFollowing(userId, id);
        setIsFollowing(res.data.is_following || false);
      } catch (err) {
        console.error(err);
      }
    };

    if (id) {
      loadNovel();
      loadChapters();
      loadFollowStatus();
    }
  }, [id, userId]);

  // ฟังก์ชันติดตาม/เลิกติดตาม
  const handleFollowToggle = async () => {
    if (!userId) return toast.warn("กรุณาเข้าสู่ระบบก่อน!");
    setLoadingFollow(true);
    try {
      if (isFollowing) {
        await unfollowNovel(userId, id);
        setIsFollowing(false);
        // toast.success("เลิกติดตามเรียบร้อย");
      } else {
        await followNovel(userId, id);
        setIsFollowing(true);
        // toast.success("ติดตามเรียบร้อย");
      }
    } catch (err) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาด โปรดลองใหม่อีกครั้ง");
    } finally {
      setLoadingFollow(false);
    }
  };

  // State สำหรับ Like
  const [liked, setLiked] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);

  // โหลดสถานะ Like ตอนเริ่มต้น
  useEffect(() => {
    const loadLikeStatus = async () => {
      if (!userId) return;
      try {
        const res = await isLiked(userId, id);
        setLiked(res.data.liked || false);
      } catch (err) {
        console.error(err);
      }
    };
    loadLikeStatus();
  }, [userId, id]);

  // ฟังก์ชันกด Like/Unlike
  const handleLikeToggle = async () => {
    if (!userId) return toast.warn("กรุณาเข้าสู่ระบบก่อน!");
    setLoadingLike(true);
    try {
      if (liked) {
        await unlikeNovel(userId, id);
        setLiked(false);
        setNovel(prev => ({
          ...prev,
          like_count: (prev.like_count || 1) - 1, // ลด 1
        }));
        // toast.success("ยกเลิกถูกใจเรียบร้อย");
      } else {
        await likeNovel(userId, id);
        setLiked(true);
        setNovel(prev => ({
          ...prev,
          like_count: (prev.like_count || 0) + 1, // เพิ่ม 1
        }));
        // toast.success("ถูกใจเรียบร้อย");
      }
    } catch (err) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาด โปรดลองใหม่อีกครั้ง");
    } finally {
      setLoadingLike(false);
    }
  };

  // รีเฟรชข้อมูลนิยาย (เช่น หลังคอมเมนต์เพิ่ม/ลบ)
  const refreshNovel = async () => {
    try {
      const res = await readNovelById(id);
      setNovel(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const [authorName, setAuthorName] = useState("");

  useEffect(() => {
    const fetchAuthor = async () => {
      if (!novel?.user_id) return;
      try {
        const res = await getUserProfile(novel.user_id);
        setAuthorName(res.data.display_name || "");
      } catch (err) {
        // console.error("ไม่สามารถโหลดข้อมูลผู้แต่งได้", err);
      }
    };

    fetchAuthor();
  }, [novel?.user_id]);

  if (!novel) return <p className="text-center mt-10 text-gray-500">กำลังโหลด...</p>;

  return (
    <div className="w-full space-y-6">

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
            <button
              onClick={() => navigate(`/novel/${id}`)}
              className="hover:text-gray-900 transition-colors cursor-pointer"
            >
              {novel.title || "นิยายไม่มีชื่อ"}
            </button>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* การ์ดนิยาย */}
      <Card className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* ปกนิยาย */}
          <div className="w-full md:w-1/4 flex justify-center">
            <div className="relative w-48 h-64 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
              <img
                src={
                  novel.cover_image_url.startsWith("http")
                    ? novel.cover_image_url
                    : `${import.meta.env.VITE_UPLOAD_BASE}/${novel.cover_image_url}`
                }
                alt="Cover"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* ข้อมูลนิยาย */}
          <div className="flex-1 flex flex-col gap-4">
            <h1 className="text-3xl font-bold">{novel.title}</h1>

            <div className="space-y-2 text-gray-700">

              <p className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/writer/${novel.user_id}`)}
                  className="flex items-center gap-2 text-blue-600 cursor-pointer no-underline hover:no-underline focus:no-underline active:no-underline"
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-2 border-2 border-white">
                    <span className="text-gray-500 text-xl">{authorName?.[0] || "?"}</span>
                  </div>
                  <span>{authorName}</span>
                </button>
              </p>

              <p>
                <span className="font-medium">หมวดหมู่: </span>
                {novel.categories?.length ? (
                  novel.categories.map((c, idx) => (
                    <span key={c.category_id} className="inline-flex items-center">
                      <button
                        onClick={() => navigate(`/category/${c.category_id}`)}
                        className="text-gray-600 hover:underline ml-1 hover:text-gray-700 cursor-pointer"
                      >
                        {c.name}
                      </button>
                      {idx < novel.categories.length - 1 && <span>, </span>}
                    </span>
                  ))
                ) : (
                  "-"
                )}
              </p>
            </div>

            {/* ปุ่ม */}
            <div className="flex flex-wrap gap-3 mt-3">
              {/* อ่านตอนแรก */}
              <Button
                onClick={() => {
                  if (chapters.length > 0) {
                    navigate(`/novel/${id}/chapter/1`);
                  } else {
                    toast.info("ไม่มีตอนให้เลือก");
                  }
                }}
                className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 font-medium transition-colors cursor-pointer"
              >
                อ่านตอนแรก
              </Button>

              {/* Like */}
              <Button
                onClick={handleLikeToggle}
                disabled={loadingLike}
                className={`px-4 py-2 rounded-md font-medium transition-colors cursor-pointer ${liked
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
              >
                <Heart className={`w-5 h-5 ${liked ? "fill-red-600 text-white" : ""}`} />
              </Button>

              {/* Follow */}
              <Button
                onClick={handleFollowToggle}
                className={`px-4 py-2 rounded-md font-medium transition-colors cursor-pointer ${isFollowing
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
              >
                {isFollowing ? "กำลังติดตาม" : "ติดตาม"}
              </Button>
            </div>

            {/* สถิติ */}
            <div className="flex items-center gap-6 mt-4 text-gray-600 text-sm">
              <Stat icon={<Eye className="w-5 h-5" />} label={novel.view_count || 0} />
              <Stat icon={<List className="w-5 h-5" />} label={novel.chapter_count || 0} />
              <Stat icon={<MessageCircle className="w-5 h-5" />} label={novel.comment_count || 0} />
              <Stat icon={<Heart className="w-5 h-5" />} label={novel.like_count || 0} />
            </div>
          </div>
        </div>

        {/* รายละเอียด */}
        <div>
          <h2 className="text-lg font-semibold mb-2">รายละเอียด</h2>
          <p >{novel.description || "-"}</p>
          <p className="mt-3">
            <span className="font-semibold">ผู้แต่ง: </span>
            {novel.author_name || "-"}
          </p>
          <p>
            <span className="font-semibold">ผู้แปล: </span>
            {novel.translator_name || "-"}
          </p>
        </div>
      </Card>

      {/* ตอนทั้งหมด */}
      <Card className="p-6 space-y-6">
        <div className="text-xl font-bold mb-0">ตอนทั้งหมด ({novel.chapter_count || 0})</div>
        <ChaptersAccordion chapters={chapters} />
      </Card>

      {/* คอมเมนต์ */}
      <Card className="p-6 space-y-6">
        <div className="text-xl font-bold mb-0">ความคิดเห็น ({novel.comment_count || 0})</div>
        <CommentSection novelId={id} onCommentChange={refreshNovel} />
      </Card>
    </div>
  );
};

// ======= คอมโพเนนต์สถิติ =======
const Stat = ({ icon, label }) => (
  <div className="flex items-center gap-1 font-medium text-gray-700">
    {icon} <span>{label.toLocaleString()}</span>
  </div>
);

export default NovelDetail;
