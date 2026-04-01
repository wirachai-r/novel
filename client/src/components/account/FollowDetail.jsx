"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFollowedNovels } from "@/api/follow";
import { getFollowedWriters } from "@/api/follow_writers";
import useAuthStore from "@/store/novel-store";
import NovelCard from "@/components/NovelCard";
import { Button } from "@/components/ui/button";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const FollowDetail = () => {
    const { user, checkAuth, token } = useAuthStore();
    const navigate = useNavigate();
    const userId = user?.user_id;

    const [novels, setNovels] = useState([]);
    const [writers, setWriters] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const limit = 12;

    useEffect(() => {
        if (token) checkAuth();
    }, [token, checkAuth]);

    const [writersPage, setWritersPage] = useState(1);
    const [writersTotalPages, setWritersTotalPages] = useState(1);
    const writersLimit = 6; // แก้จาก 1 เป็น 12

    const [totalNovels, setTotalNovels] = useState(0);
    const [totalWriters, setTotalWriters] = useState(0);

    // ดึงนิยาย
    const fetchFollowed = async (newPage = 1) => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            const resNovels = await getFollowedNovels(userId, newPage, limit);
            setNovels(resNovels.data.records || []);
            setPage(newPage);
            setTotalPages(resNovels.data.totalPages || 1);

            // จำนวนทั้งหมดจริง ๆ จาก API
            setTotalNovels(resNovels.data.totalRecords || resNovels.data.total || 0);
        } catch (err) {
            console.error(err);
            setError("ไม่สามารถโหลดรายการติดตามได้");
        } finally {
            setLoading(false);
        }
    };

    // ดึงนักเขียน
    const fetchWriters = async (newPage = 1) => {
        if (!userId) return;
        try {
            const res = await getFollowedWriters(userId, newPage, writersLimit);
            setWriters(res.data.records || []);
            setWritersPage(newPage);
            setWritersTotalPages(res.data.totalPages || 1);

            // จำนวนทั้งหมดจริง ๆ จาก API
            setTotalWriters(res.data.totalRecords || res.data.total || 0);
        } catch (err) {
            console.error(err);
            setError("ไม่สามารถโหลดนักเขียนที่ติดตามได้");
        }
    };

    // เรียกครั้งแรก
    useEffect(() => {
        fetchFollowed(1);
        fetchWriters(1);
    }, [userId]);


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
                                onClick={() => navigate("/follow")}
                                className="hover:text-gray-900 transition-colors cursor-pointer"
                            >
                                การติดตาม
                            </button>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* นักเขียนที่ติดตาม */}
            <h2 className="text-lg font-semibold my-4">นักเขียนที่ติดตาม ({totalWriters})</h2>
            {writers.length === 0 ? (
                <p className="text-gray-500">คุณยังไม่ได้ติดตามนักเขียนคนใด</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-6">
                    {writers.map((writer, idx) => (
                        <div
                            key={writer.writer_id || idx}
                            onClick={() => navigate(`/writer/${writer.writer_id}`)}
                            className="cursor-pointer rounded-xl border border-gray-200 p-4 flex flex-col items-center hover:shadow-md transition"
                        >
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-2 border-4 border-white">
                                <span className="text-gray-500 text-xl">{writer.display_name?.[0] || "?"}</span>
                            </div>
                            <p className="text-sm text-center truncate">{writer.display_name}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {writers.length > 0 && (
                <div className="flex items-center justify-between text-sm text-gray-500 py-2">
                    <div>
                        หน้า {writersPage} จาก {writersTotalPages}
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchWriters(writersPage - 1)}
                            disabled={writersPage <= 1}
                        >
                            ก่อนหน้า
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchWriters(writersPage + 1)}
                            disabled={writersPage >= writersTotalPages}
                        >
                            ถัดไป
                        </Button>
                    </div>
                </div>
            )}

            {/* นิยายที่ติดตาม */}
            <h2 className="text-lg font-semibold my-4">รายการนิยายที่ติดตาม ({totalNovels})</h2>
            {novels.length === 0 ? (
                <p className="text-gray-500">คุณยังไม่ได้ติดตามนิยายเรื่องใดเลย</p>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6 xl:gap-x-8 mt-5">
                    {novels.map((novel, index) => (
                        <NovelCard key={novel.novel_id || index} item={novel} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {novels.length > 0 && (
                <div className="flex items-center justify-between text-sm text-gray-500 py-4">
                    <div>
                        หน้า {page} จาก {totalPages}
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchFollowed(page - 1)}
                            disabled={page <= 1}
                        >
                            ก่อนหน้า
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchFollowed(page + 1)}
                            disabled={page >= totalPages}
                        >
                            ถัดไป
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FollowDetail;
