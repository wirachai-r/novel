"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserProfile } from "@/api/user";
import { readNovelsByUser } from "@/api/novel";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { IconUser } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import NovelCard from "@/components/NovelCard";
import { followWriter, unfollowWriter, isFollowingWriter } from "@/api/follow_writers";
import useAuthStore from "@/store/novel-store";
import { useNavigate } from "react-router-dom";

const WriterDetail = () => {
  const navigate = useNavigate();
  const { writerId } = useParams();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState({ display_name: "" });
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!writerId) return;
      setLoading(true);
      try {
        const resProfile = await getUserProfile(writerId);
        setProfile({ display_name: resProfile.data.display_name || "ไม่ระบุชื่อ" });

        console.log(resProfile)

        const resNovels = await readNovelsByUser(writerId, 1, 100);
        setNovels(resNovels.data.records || []);

        if (user?.user_id) {
          const resFollow = await isFollowingWriter(user.user_id, writerId);
          setIsFollowing(resFollow.data.is_following);
        }
      } catch (err) {
        // toast.error("ไม่สามารถโหลดข้อมูลนักเขียนได้");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [writerId, user?.user_id]);

  const handleFollowToggle = async () => {
    if (!user?.user_id) return toast.warn("กรุณาเข้าสู่ระบบก่อน!");
    setLoadingFollow(true);
    try {
      if (isFollowing) {
        await unfollowWriter(user.user_id, writerId);
        setIsFollowing(false);
        // toast.success("เลิกติดตามนักเขียนเรียบร้อยแล้ว");
      } else {
        await followWriter(user.user_id, writerId);
        setIsFollowing(true);
        // toast.success("ติดตามนักเขียนเรียบร้อยแล้ว");
      }
    } catch (err) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาด โปรดลองใหม่อีกครั้ง");
    } finally {
      setLoadingFollow(false);
    }
  };

  if (loading) return <div className="text-center py-6">กำลังโหลด...</div>;

  return (
    <div className="space-y-6">
      {/* Card 1: Writer Info */}
      <Card className="w-full mx-auto rounded-2xl shadow-md border border-gray-100 bg-gradient-to-br from-white to-gray-50">
        <CardContent
          className={`flex flex-col md:flex-row gap-8 p-8 items-center ${novels.length === 0 ? "justify-center text-center" : "md:items-start"
            }`}
        >

          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-2 border-4 border-white">
            <span className="text-gray-500 text-5xl">{profile.display_name?.[0] || "?"}</span>
          </div>

          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-800">
              {profile.display_name}
            </CardTitle>

            {/* แสดงเฉพาะถ้ามีนิยาย */}
            {novels.length > 0 && (
              <p className="text-gray-500">นิยายทั้งหมด {novels.length} เรื่อง</p>
            )}

            {/* ปุ่ม follow */}
            {novels.length > 0 && (
              <Button
                onClick={handleFollowToggle}
                className={`px-4 py-2 rounded-md font-medium transition-colors cursor-pointer ${isFollowing
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                disabled={loadingFollow || novels.length === 0} // ถ้าอยาก disable เมื่อไม่มีนิยาย
              >
                {isFollowing ? "กำลังติดตาม" : "ติดตาม"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Novels */}
      {novels.length > 0 && (
        <Card className="w-full mx-auto rounded-2xl shadow-md border border-gray-100">
          <CardContent>
            <CardTitle className="text-lg font-semibold mb-4">
              รายการนิยายทั้งหมด ({novels.length})
            </CardTitle>
            {novels.length === 0 ? (
              <p className="text-gray-500">ยังไม่มีนิยาย</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6 xl:gap-x-8 mt-5">
                {novels.map((novel, index) => (
                  <NovelCard key={novel.novel_id || index} item={novel} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div
        onClick={() => navigate(-1)}
        className="mt-auto flex flex-row items-center justify-center space-x-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100 transition px-4 py-3"
      >
        ย้อนกลับ
      </div>
    </div>
  );
};

export default WriterDetail;
