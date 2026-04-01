import React, { useEffect, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { readAllNovel, updateNovelStatus } from "@/api/admin";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import { Eye, List } from "lucide-react";

const DataNovel = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ======= ดึงข้อมูลนิยาย =======
  const fetchNovels = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await readAllNovel(pageNumber, pageSize);
      setData(res.data.records || []);
      setTotalRecords(res.data.totalRecords || 0);
      setTotalPages(Math.ceil((res.data.totalRecords || 0) / pageSize));
      setPage(pageNumber);
    } catch (err) {
      console.error(err);
      toast.error("ไม่สามารถโหลดข้อมูลนิยายได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNovels();
  }, []);

  // ======= เปลี่ยนสถานะนิยาย =======
  const handleStatusChange = async (novel_id, newStatus) => {
    try {
      await updateNovelStatus(novel_id, newStatus);
      toast.success("เปลี่ยนสถานะนิยายเรียบร้อยแล้ว");
      setData(prev => prev.map(n => n.novel_id === novel_id ? { ...n, status: newStatus } : n));
    } catch (err) {
      console.error(err);
      toast.error("ไม่สามารถอัปเดตสถานะนิยายได้");
    }
  };

  // ======= กำหนดคอลัมน์ตาราง =======
  const columns = [
    { id: "index", header: "#", cell: ({ row }) => (page - 1) * pageSize + row.index + 1 },
    {
      accessorKey: "cover_image_url",
      header: "ภาพปก",
      cell: ({ row }) => (
        <div className="relative w-26 h-38">
          <img
            src={row.original.cover_image_url.startsWith("http")
              ? row.original.cover_image_url
              : `${import.meta.env.VITE_UPLOAD_BASE}/${row.original.cover_image_url}`}
            alt={row.original.title}
            className="w-full h-full object-cover rounded-md"
          />
        </div>
      )
    },
    { accessorKey: "title", header: "ชื่อเรื่อง", filterFn: "includesString", },
    { accessorKey: "display_name", header: "ผู้สร้าง" },

    // จำนวนตอน
    {
      accessorKey: "chapter_count",
      header: () => "จำนวนตอน",
      cell: ({ row }) => (
        <div className="flex items-center space-x-1">
          <List className="w-4 h-4" />
          <span>{row.original.chapter_count || 0}</span>
        </div>
      )
    },

    // จำนวนผู้ชม
    {
      accessorKey: "view_count",
      header: () => "ผู้ชม",
      cell: ({ row }) => (
        <div className="flex items-center space-x-1">
          <Eye className="w-4 h-4" />
          <span>{row.original.view_count?.toLocaleString() || 0}</span>
        </div>
      )
    },

    // สถานะ
    {
      accessorKey: "status",
      header: "สถานะ",
      cell: ({ row }) => {
        const novel = row.original;
        return (
          <Select
            value={novel.status} // ต้องตรงกับ value ของ SelectItem
            onValueChange={(value) =>
              handleStatusChange(novel.novel_id, value)
            }
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="เลือกสถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">แบบร่าง</SelectItem>
              <SelectItem value="ongoing">กำลังดำเนินการ</SelectItem>
              <SelectItem value="completed">จบแล้ว</SelectItem>
              <SelectItem value="paused">หยุดชั่วคราว</SelectItem>
            </SelectContent>
          </Select>
        );
      }
    }
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (loading) return <div className="p-4">กำลังโหลดข้อมูลนิยาย...</div>;

  return (
    <div className="w-full">
      {/* ฟิลเตอร์ชื่อเรื่อง */}
      <div className="flex items-center py-4 gap-2">
        <Input
          placeholder="ค้นหาชื่อเรื่อง..."
          value={table.getColumn("title")?.getFilterValue() ?? ""}
          onChange={(e) => table.getColumn("title")?.setFilterValue(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* ตารางนิยาย */}
      <div className="overflow-hidden rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className="bg-muted/40">
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id} className="px-4 py-2">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="hover:bg-muted/20">
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="px-4 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center h-24">
                  ไม่พบผลลัพธ์
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* การแบ่งหน้า */}
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
  );
};

export default DataNovel;
