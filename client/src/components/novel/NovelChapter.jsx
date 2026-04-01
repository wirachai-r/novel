"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { readChapter, updateNovelView, readChaptersByNovel } from "@/api/chapter";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import CommentSection from "./CommentSection";

const NovelChapter = () => {
    const { id, chapterNumber } = useParams();
    const navigate = useNavigate();

    const [chapter, setChapter] = useState(null);
    const [chapterCount, setChapterCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const viewedRef = useRef(false);

    // โหลดเนื้อหาตอนและจำนวนตอนทั้งหมด
    useEffect(() => {
        let ignore = false;

        const loadChapterData = async () => {
            try {
                const [chapterRes, chaptersRes] = await Promise.all([
                    readChapter(id, chapterNumber),
                    readChaptersByNovel(id),
                ]);

                if (!ignore) {
                    setChapter(chapterRes.data);
                    setChapterCount(chaptersRes.data?.records?.length || 0);
                }
            } catch (err) {
                console.error("เกิดข้อผิดพลาดในการโหลดตอน:", err);
            } finally {
                if (!ignore) setLoading(false);
            }
        };

        if (id && chapterNumber) loadChapterData();

        return () => {
            ignore = true;
        };
    }, [id, chapterNumber]);

    // อัปเดตจำนวนครั้งที่เข้าชม
    useEffect(() => {
        if (!id || viewedRef.current) return;
        const updateView = async () => {
            try {
                await updateNovelView(id);
                viewedRef.current = true;
            } catch (err) {
                console.error("เกิดข้อผิดพลาดในการอัปเดตจำนวนครั้งเข้าชม:", err);
            }
        };
        updateView();
    }, [id]);

    // Tiptap editor สำหรับเนื้อหา
    const editor = useEditor(
        {
            extensions: [StarterKit],
            content: chapter?.content || "<p>ไม่มีเนื้อหา</p>",
            editable: false,
        },
        [chapter]
    );

    if (loading) return <p className="text-center mt-10 text-gray-500">กำลังโหลด...</p>;
    if (!chapter) return <p className="text-center mt-10 text-red-500">ไม่พบตอนนี้</p>;

    const currentChapter = parseInt(chapterNumber, 10);

    return (
        <div className="max-w-3xl mx-auto">
            {/* Breadcrumb */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <button onClick={() => navigate("/")} className="hover:text-gray-900 transition-colors cursor-pointer">
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
                            {chapter.novel_title}
                        </button>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <button
                            onClick={() => navigate(`/novel/${id}/chapter/${chapterNumber}`)}
                            className="hover:text-gray-900 transition-colors cursor-pointer"
                        >
                            เนื้อหา
                        </button>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* ชื่อเรื่องตอน */}
            <h1 className="text-3xl font-bold mt-10">{chapter.title}</h1>
            {/* <p className="text-sm text-gray-500 mt-2">
                อัปเดตเมื่อ: {chapter.updated_at}
            </p> */}

            {/* การนำทางตอน */}
            <div className="flex items-center justify-between mt-6 gap-3">
                <Button
                    variant="outline"
                    disabled={currentChapter <= 1}
                    onClick={() => navigate(`/novel/${id}/chapter/${currentChapter - 1}`)}
                    className="cursor-pointer"
                >
                    ตอนก่อนหน้า
                </Button>

                {/* เลือกตอน */}
                <Select
                    value={String(currentChapter)}
                    onValueChange={(value) => navigate(`/novel/${id}/chapter/${value}`)}
                >
                    <SelectTrigger className="w-40 cursor-pointer">
                        <SelectValue placeholder="เลือกตอน" />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: chapterCount }, (_, i) => (
                            <SelectItem key={i + 1} value={String(i + 1)}>
                                ตอนที่ {i + 1}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button
                    variant="outline"
                    disabled={currentChapter >= chapterCount}
                    onClick={() => navigate(`/novel/${id}/chapter/${currentChapter + 1}`)}
                    className="cursor-pointer"
                >
                    ตอนถัดไป
                </Button>
            </div>

            {/* เนื้อหา */}
            <div className="mt-6 p-4 border rounded-md bg-gray-50 text-gray-800">
                <EditorContent editor={editor} />
            </div>

            {/* Navigation ซ้ำด้านล่าง */}
            <div className="flex items-center justify-between mt-6 gap-3">
                <Button
                    variant="outline"
                    disabled={currentChapter <= 1}
                    onClick={() => navigate(`/novel/${id}/chapter/${currentChapter - 1}`)}
                    className="cursor-pointer"
                >
                    ตอนก่อนหน้า
                </Button>

                <Select
                    value={String(currentChapter)}
                    onValueChange={(value) => navigate(`/novel/${id}/chapter/${value}`)}
                >
                    <SelectTrigger className="w-40 cursor-pointer">
                        <SelectValue placeholder="เลือกตอน" />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: chapterCount }, (_, i) => (
                            <SelectItem key={i + 1} value={String(i + 1)}>
                                ตอนที่ {i + 1}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button
                    variant="outline"
                    disabled={currentChapter >= chapterCount}
                    onClick={() => navigate(`/novel/${id}/chapter/${currentChapter + 1}`)}
                    className="cursor-pointer"
                >
                    ตอนถัดไป
                </Button>
            </div>

            {/* คอมเมนต์ */}
            <div className="p-6 space-y-6 mt-6 border rounded-md text-gray-800">
                <CommentSection novelId={id} chapterNumber={chapterNumber} />
            </div>
        </div>
    );
};

export default NovelChapter;