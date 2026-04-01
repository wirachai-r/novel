"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CommentCard from "./CommentCard";
import useAuthStore from "@/store/novel-store";
import { readComments, createComment, deleteComment } from "@/api/comment";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CommentSection = ({ novelId, chapterNumber = null, onCommentChange }) => {
  const { user, checkAuth, token } = useAuthStore();

  useEffect(() => {
    if (token) {
      checkAuth();
    }
  }, [token, checkAuth]);
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  // โหลดความคิดเห็นจาก server
  const loadComments = async () => {
    try {
      const res = await readComments(novelId, chapterNumber);
      setComments(res.data.records || []);
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการโหลดความคิดเห็น:", err);
      setComments([]);
    }
  };

  useEffect(() => {
    if (novelId) loadComments();
  }, [novelId, chapterNumber]);

  // เพิ่มความคิดเห็นใหม่
  const handleAddComment = async (e) => {
    e.preventDefault(); // ป้องกัน reload หน้า
    if (!newComment.trim()) return;
    if (!user) return toast.warn("กรุณาเข้าสู่ระบบก่อน!");

    setLoading(true);
    try {
      const commentData = {
        user_id: user.user_id,
        novel_id: novelId,
        content: newComment,
      };
      if (chapterNumber !== null) commentData.chapter_number = chapterNumber;

      await createComment(commentData);
      setNewComment("");
      loadComments();
      // toast.success("ส่งความคิดเห็นเรียบร้อย");

      if (onCommentChange) onCommentChange();

    } catch (err) {
      toast.error("ไม่สามารถส่งความคิดเห็นได้ โปรดลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  // ลบความคิดเห็น
  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter((c) => c.comment_id !== commentId));
      // toast.success("ลบความคิดเห็นเรียบร้อย");

      if (onCommentChange) onCommentChange();

    } catch (err) {
      toast.error("ไม่สามารถลบความคิดเห็นได้ โปรดลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="space-y-4">
      {/* ฟอร์มเพิ่มความคิดเห็น */}
      <form className="flex gap-2" onSubmit={handleAddComment}>
        <Input
          type="text"
          placeholder="เขียนความคิดเห็น..."
          className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={loading}
        />
        <Button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer"
          disabled={loading}
        >
          ส่ง
        </Button>
      </form>

      {/* รายการความคิดเห็น */}
      <div className="space-y-3 overflow-y-auto">
        {comments.length > 0 ? (
          comments.map((c) => (
            <CommentCard
              key={c.comment_id}  
              userId={c.user_id}
              userName={c.display_name || "ผู้ใช้ทั่วไป"}
              content={c.content}
              createdAt={c.created_at}
              onDelete={() => handleDeleteComment(c.comment_id)}
              canDelete={user?.user_id === c.user_id}
            />
          ))
        ) : (
          <p className="text-gray-500 text-sm p-2">ยังไม่มีความคิดเห็น</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
