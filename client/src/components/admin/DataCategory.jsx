import React, { useEffect, useState } from "react"
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { readAllCategory, createCategory, updateCategory, deleteCategory } from "@/api/category";
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const DataCategory = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [page, setPage] = useState(1)
    const [pageSize] = useState(10)

    const [newName, setNewName] = useState("")
    const [newDescription, setNewDescription] = useState("")
    const [creating, setCreating] = useState(false)

    const [totalRecords, setTotalRecords] = useState(0)
    const [totalPages, setTotalPages] = useState(1)

    const [editingCategory, setEditingCategory] = useState(null)
    const [editName, setEditName] = useState("")
    const [editDescription, setEditDescription] = useState("")
    const [editOpen, setEditOpen] = useState(false)

    const globalFilterFn = (row, columnId, filterValue) => {
        const search = filterValue.toLowerCase();
        return (
            row.original.name?.toLowerCase().includes(search) ||
            row.original.description?.toLowerCase().includes(search)
        );
    };

    const fetchCategories = async (pageNumber = 1) => {
        try {
            setLoading(true)
            const res = await readAllCategory(pageNumber, pageSize)
            setData(res.data.records || [])
            setTotalRecords(res.data.totalRecords || 0)
            setTotalPages(Math.ceil((res.data.totalRecords || 0) / pageSize))
            setPage(pageNumber)
        } catch (err) {
            console.error("API ERROR:", err)
            setError(`ไม่สามารถโหลดหมวดหมู่ได้: ${err.message}`)
            toast.error("ไม่สามารถโหลดหมวดหมู่ได้")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleCreateCategory = async () => {
        if (!newName.trim()) return toast.error("กรุณากรอกชื่อหมวดหมู่")
        try {
            setCreating(true);
            await createCategory({ name: newName, description: newDescription });

            toast.success("สร้างหมวดหมู่เรียบร้อยแล้ว");

            fetchCategories(page);

            setNewName("");
            setNewDescription("");
        } catch (err) {
            console.error("Create ERROR:", err);
            toast.error("ไม่สามารถสร้างหมวดหมู่ได้");
        } finally {
            setCreating(false);
        }
    }

    const openEditDialog = (category) => {
        setEditingCategory(category)
        setEditName(category.name)
        setEditDescription(category.description)
        setEditOpen(true)
    }

    const handleUpdateCategory = async (e) => {
        e.preventDefault()
        try {
            await updateCategory({
                category_id: editingCategory.category_id,
                name: editName,
                description: editDescription,
            })
            setEditOpen(false)

            toast.success("แก้ไขหมวดหมู่เรียบร้อยแล้ว")

            fetchCategories(page);
        } catch (err) {
            console.error("Update ERROR:", err)
            toast.error("ไม่สามารถแก้ไขหมวดหมู่ได้")
        }
    }

    const [deleteCategoryId, setDeleteCategoryId] = useState(null);
    const [alertOpen, setAlertOpen] = useState(false);

    const handleConfirmDelete = async () => {
        try {
            await deleteCategory(deleteCategoryId);
            toast.success("ลบหมวดหมู่เรียบร้อยแล้ว");
            fetchCategories(page);
        } catch (err) {
            const msg = err.response?.data?.message || "ไม่สามารถลบหมวดหมู่ได้";
            toast.error(msg);
        } finally {
            setAlertOpen(false);
            setDeleteCategoryId(null);
        }
    };

    const columns = [
        {
            id: "index",
            header: "#",
            cell: ({ row }) => (page - 1) * pageSize + row.index + 1,
        },
        {
            accessorKey: "name",
            header: "ชื่อหมวดหมู่",
            cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
        },
        {
            accessorKey: "description",
            header: "รายละเอียด",
            cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("description")}</div>,
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const category = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">เปิดเมนู</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel className={"font-bold"}>ตัวเลือก</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openEditDialog(category)}>
                                แก้ไข
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    setDeleteCategoryId(category.category_id);
                                    setAlertOpen(true);
                                }}
                                disabled={category.novel_count > 0} // ป้องกันลบ
                            >
                                <div className={category.novel_count > 0 ? "text-gray-400" : "text-red-600 hover:text-red-700"}>
                                    ลบ
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn,
    })

    if (loading) return <div className="p-4">กำลังโหลดหมวดหมู่...</div>
    if (error) return <div className="p-4 text-red-500">{error}</div>

    return (
        <div className="w-full">
            {/* Toolbar */}
            <div className="flex items-center py-4 gap-2">
                <Input
                    placeholder="ค้นหาหมวดหมู่..."
                    value={table.getState().globalFilter ?? ""}
                    onChange={(e) => table.setGlobalFilter(e.target.value)}
                    className="max-w-sm"
                />
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="default" className="ml-2">
                            <Plus className="mr-2 h-4 w-4" /> เพิ่มหมวดหมู่
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-white rounded-md p-4 opacity-0 animate-fade-in"
                        style={{
                            animationDuration: "0.2s",
                            animationFillMode: "forwards",
                        }}>
                        <DialogHeader>
                            <DialogTitle>เพิ่มหมวดหมู่ใหม่</DialogTitle>
                            <DialogDescription>
                                กรอกข้อมูลหมวดหมู่ใหม่ของคุณที่นี่
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            handleCreateCategory()
                        }}>
                            <div className="space-y-2 py-2">
                                <label className="block text-sm font-medium mb-1">ชื่อหมวดหมู่</label>
                                <Input
                                    placeholder="กรอกชื่อหมวดหมู่"
                                    value={newName}
                                    required
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                                <label className="block text-sm font-medium mb-1">รายละเอียด</label>
                                <Input
                                    placeholder="กรอกรายละเอียด"
                                    value={newDescription}
                                    required
                                    onChange={(e) => setNewDescription(e.target.value)}
                                />
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
            </div>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white rounded-md p-4 opacity-0 animate-fade-in"
                    style={{ animationDuration: "0.2s", animationFillMode: "forwards" }}>
                    <DialogHeader>
                        <DialogTitle>แก้ไขหมวดหมู่</DialogTitle>
                        <DialogDescription>
                            แก้ไขข้อมูลหมวดหมู่ของคุณที่นี่
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateCategory}>
                        <div className="space-y-2 py-2">
                            <label className="block text-sm font-medium mb-1">ชื่อหมวดหมู่</label>
                            <Input
                                placeholder="กรอกชื่อหมวดหมู่"
                                value={editName}
                                required
                                onChange={(e) => setEditName(e.target.value)}
                            />
                            <label className="block text-sm font-medium mb-1">รายละเอียด</label>
                            <Input
                                placeholder="กรอกรายละเอียด"
                                value={editDescription}
                                required
                                onChange={(e) => setEditDescription(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">ยกเลิก</Button>
                            </DialogClose>
                            <Button type="submit">บันทึก</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white rounded-md p-4 opacity-0 animate-fade-in"
                    style={{ animationDuration: "0.2s", animationFillMode: "forwards" }}>
                    <DialogHeader>
                        <DialogTitle>คุณแน่ใจหรือไม่?</DialogTitle>
                        <DialogDescription>
                            การลบหมวดหมู่นี้ไม่สามารถย้อนกลับได้
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">ยกเลิก</Button>
                        </DialogClose>
                        <Button
                            className=" bg-red-600 text-white rounded hover:bg-red-700"
                            onClick={handleConfirmDelete}
                        >
                            ลบ
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Table */}
            <div className="overflow-hidden rounded-md border shadow-sm">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-muted/40">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="px-4 py-2">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="hover:bg-muted/20">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-4 py-2">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    ไม่พบข้อมูล
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 py-4">
                <div>
                    หน้า {page} จาก {totalPages}
                </div>
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchCategories(page - 1)}
                        disabled={page <= 1}
                    >
                        ก่อนหน้า
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchCategories(page + 1)}
                        disabled={page >= totalPages}
                    >
                        ถัดไป
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default DataCategory
