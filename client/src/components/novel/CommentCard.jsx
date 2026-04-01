"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { IconUser } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Trash } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const CommentCard = ({
  userId,
  userName,
  userAvatar,
  content,
  createdAt,
  onDelete,
  canDelete,
}) => {

  const navigate = useNavigate();

  const [alertOpen, setAlertOpen] = useState(false);

  const formattedDate = new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(createdAt)) + " น.";

  const handleConfirmDelete = () => {
    setAlertOpen(false);
    onDelete && onDelete();
  };

  return (
    <>
      <Card className="p-3 border-t border-t-base-300 flex flex-col sm:flex-row sm:justify-between gap-2">
        {/* ซ้าย: Avatar + ชื่อ + ความคิดเห็น */}
        <div className="flex flex-1 gap-2">
          <Avatar className="h-12 w-12 rounded-full flex-shrink-0">
            {userAvatar ? (
              <AvatarImage src={userAvatar} />
            ) : (
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-2 border-2 border-white">
                <span className="text-gray-500 text-xl">{userName?.[0] || "?"}</span>
              </div>
            )}
          </Avatar>
          <div className="flex flex-col flex-1">
            {/* ชื่อ + ปุ่มลบ */}
            <div className="flex items-center justify-between">
              <div>
                <span
                  className="font-semibold text-gray-800 truncate cursor-pointer hover:underline"
                  onClick={() => userId && navigate(`/writer/${userId}`)}
                >
                  {userName}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {formattedDate}
                </span>
              </div>
              {canDelete && (
                <Button
                  onClick={() => setAlertOpen(true)}
                  size="sm"
                  variant="destructive"
                  className="text-xs px-2 py-1 cursor-pointer"
                >
                  <Trash />
                </Button>
              )}
            </div>

            {/* เนื้อหา */}
            <div className="text-gray-800 font-light leading-6 mt-1">
              {content}
            </div>
          </div>
        </div>
      </Card>

      {/* กล่องยืนยันการลบ */}
      <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
        <DialogContent
          className="sm:max-w-[425px] bg-white rounded-md p-4 opacity-0 animate-fade-in"
          style={{ animationDuration: "0.2s", animationFillMode: "forwards" }}
        >
          <DialogHeader>
            <DialogTitle>คุณแน่ใจหรือไม่?</DialogTitle>
            <DialogDescription>
              การกระทำนี้ไม่สามารถย้อนกลับได้ การลบความคิดเห็นนี้จะถูกลบถาวร
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">ยกเลิก</Button>
            </DialogClose>
            <Button
              className="bg-red-600 text-white rounded hover:bg-red-700"
              onClick={handleConfirmDelete}
            >
              ลบ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CommentCard;
