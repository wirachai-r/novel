"use client"

import React, { useEffect, useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { Switch } from "@/components/ui/switch"

import {
  readAllBanner,
  createBanner,
  updateBanner,
  deleteBanner,
  uploadBannerImage,
} from "@/api/banner"

const DraggableRow = ({ row, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.original.banner_id.toString() })

  return (
    <TableRow
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`hover:bg-muted/20 ${isDragging ? "opacity-50 z-10" : ""}`}
      {...attributes} // ✅ เก็บ attributes ไว้กับ row
    >
      {row.getVisibleCells().map((cell) => {
        // 👉 ถ้าเป็น index column ให้ติด listeners (ลากได้)
        if (cell.column.id === "index") {
          return (
            <TableCell key={cell.id} className="px-4 py-2 cursor-grab" {...listeners}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          )
        }

        // 👉 ช่องอื่นปกติ
        return (
          <TableCell key={cell.id} className="px-4 py-2">
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        )
      })}
    </TableRow>
  )
}


const DataBanner = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)

  // --- CREATE STATE ---
  const [newTitle, setNewTitle] = useState("")
  const [newPosition, setNewPosition] = useState(1)
  const [newStatus, setNewStatus] = useState(1)
  const [newImage, setNewImage] = useState(null)
  const [newPreview, setNewPreview] = useState(null)
  const [creating, setCreating] = useState(false)

  // --- EDIT STATE ---
  const [editingBanner, setEditingBanner] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  const [editPosition, setEditPosition] = useState(1)
  const [editStatus, setEditStatus] = useState(1)
  const [editImage, setEditImage] = useState(null)
  const [editPreview, setEditPreview] = useState(null)
  const [editOpen, setEditOpen] = useState(false)

  // --- DELETE STATE ---
  const [deleteBannerId, setDeleteBannerId] = useState(null)
  const [alertOpen, setAlertOpen] = useState(false)

  const fetchBanners = async (pageNumber = 1) => {
    try {
      setLoading(true)
      const res = await readAllBanner(pageNumber, pageSize)
      setData(res.data.records || [])
      setTotalRecords(res.data.totalRecords || 0)
      setTotalPages(Math.ceil((res.data.totalRecords || 0) / pageSize))
      setPage(pageNumber)
    } catch (err) {
      console.error("API ERROR:", err)
      setError(`ไม่สามารถโหลดแบนเนอร์ได้: ${err.message}`)
      toast.error("ไม่สามารถโหลดแบนเนอร์ได้")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  useEffect(() => {
    if (data.length > 0) {
      const maxPos = Math.max(...data.map(b => b.position))
      setNewPosition(maxPos + 1)
    } else {
      setNewPosition(1)
    }
  }, [data])

  // --- CREATE ---
  const handleCreateBanner = async () => {
    if (!newTitle.trim()) return toast.error("กรุณากรอกชื่อ Banner")
    if (!newImage) return toast.error("กรุณาอัปโหลดรูปภาพ")
    try {
      setCreating(true)
      const uploadRes = await uploadBannerImage(newImage)
      const imageUrl = uploadRes.data.url
      await createBanner({ title: newTitle, image_url: imageUrl, position: newPosition, status: newStatus })
      toast.success("สร้างแบนเนอร์เรียบร้อยแล้ว")
      fetchBanners(page)

      setNewTitle("");
      setNewStatus(1);
      setNewImage(null);
      setNewPreview(null);

      // 👉 รีเซ็ต position ให้เป็นลำดับถัดไปของล่างสุด
      if (data.length > 0) {
        const maxPos = Math.max(...data.map(b => b.position))
        setNewPosition(maxPos + 1)
      } else {
        setNewPosition(1)
      }

    } catch (err) {
      console.error("Create ERROR:", err)
      toast.error("ไม่สามารถสร้างแบนเนอร์ได้")
    } finally {
      setCreating(false)
    }
  }

  // --- EDIT ---
  const openEditDialog = (banner) => {
    setEditingBanner(banner)
    setEditTitle(banner.title)
    setEditPosition(banner.position)
    setEditStatus(banner.status)
    setEditImage(null)
    setEditPreview(banner.image_url)
    setEditOpen(true)
  }

  const handleUpdateBanner = async (e) => {
    e.preventDefault()
    try {
      let imageUrl = editingBanner.image_url
      if (editImage) {
        const uploadRes = await uploadBannerImage(editImage, editingBanner.image_url)
        imageUrl = uploadRes.data.url
      }
      await updateBanner({ banner_id: editingBanner.banner_id, title: editTitle, image_url: imageUrl, position: editPosition, status: editStatus })
      toast.success("แก้ไขแบนเนอร์เรียบร้อย")
      setEditOpen(false)
      fetchBanners(page)
    } catch (err) {
      console.error("Update ERROR:", err)
      toast.error("ไม่สามารถแก้ไขแบนเนอร์ได้")
    }
  }

  // --- DELETE ---
  const handleConfirmDelete = async () => {
    try {
      await deleteBanner(deleteBannerId)
      toast.success("ลบแบนเนอร์เรียบร้อย")
      fetchBanners(page)
    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.message || "ไม่สามารถลบแบนเนอร์ได้"
      toast.error(msg)
    } finally {
      setAlertOpen(false)
      setDeleteBannerId(null)
    }
  }

  // --- COLUMNS ---
  const columns = [
    { id: "index", cell: () => <GripVertical className="h-5 w-5 text-gray-400" /> },
    {
      accessorKey: "image_url", header: "รูปภาพ", cell: ({ row }) => {
        const url = row.getValue("image_url")
        const fullUrl = url.startsWith("http") ? url : `${import.meta.env.VITE_UPLOAD_BASE}/${url}`
        return <div className="relative w-38 h-26"><img src={fullUrl} alt="Banner" className="w-full h-full object-cover rounded-md" /></div>
      }
    },
    { accessorKey: "title", header: "ชื่อ Banner", cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div> },
    { accessorKey: "position", header: "ลำดับ" },
    {
      accessorKey: "status",
      header: "สถานะ",
      cell: ({ row }) => {
        const index = row.index
        const banner = data[index]   // ✅ ใช้ state data ล่าสุดแทน row.original

        return (
          <Switch
            checked={banner.status === 1}
            onCheckedChange={async (checked) => {
              try {
                await updateBanner({
                  banner_id: banner.banner_id,
                  title: banner.title,
                  image_url: banner.image_url,
                  position: banner.position,
                  status: checked ? 1 : 0,
                })

                toast.success("อัปเดตสถานะเรียบร้อย")

                // ✅ อัปเดต state ตรง index
                setData((prev) =>
                  prev.map((b, i) =>
                    i === index ? { ...b, status: checked ? 1 : 0 } : b
                  )
                )
              } catch (err) {
                console.error("Update status error:", err)
                toast.error("ไม่สามารถอัปเดตสถานะได้")
              }
            }}
          />
        )
      },
    },
    {
      id: "actions", cell: ({ row }) => {
        const banner = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">เมนู</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>จัดการ</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => openEditDialog(banner)}>แก้ไข</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setDeleteBannerId(banner.banner_id)
                  setAlertOpen(true)
                }}
              >
                <div className="text-red-600 hover:text-red-700">ลบ</div>
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    },
  ]

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel() })

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor), useSensor(KeyboardSensor))
  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      setData((prev) => {
        const oldIndex = prev.findIndex((b) => b.banner_id.toString() === active.id)
        const newIndex = prev.findIndex((b) => b.banner_id.toString() === over.id)
        const newData = arrayMove(prev, oldIndex, newIndex)

        // ✅ อัปเดต position ใหม่เรียงจาก 1...n
        const updated = newData.map((item, index) => ({
          ...item,
          position: index + 1,
        }))
        // ✅ ส่งไป API ทีละอัน (หรือใช้ bulk API ถ้ามี)
        updated.forEach((banner) => {
          updateBanner({
            banner_id: banner.banner_id,
            title: banner.title,
            image_url: banner.image_url,
            position: banner.position,
            status: banner.status,
          }).catch((err) => console.error("Update order error:", err))
        })

        return updated
      })
      toast.success("อัปเดตลำดับเรียบร้อย")
    }
  }

  if (loading) return <div className="p-4">กำลังโหลดแบนเนอร์...</div>
  if (error) return <div className="p-4 text-red-500">{error}</div>

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex items-center py-4 gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="default">
              <Plus className="mr-2 h-4 w-4" /> เพิ่มแบนเนอร์
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] w-full max-h-[90vh] overflow-y-auto p-4 bg-white rounded-lg shadow-lg animate-fade-in">
            <DialogHeader>
              <DialogTitle>เพิ่มแบนเนอร์ใหม่</DialogTitle>
              <DialogDescription>กรอกข้อมูลแบนเนอร์ของคุณที่นี่</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateBanner() }}>
              <div className="space-y-2 py-2">
                <label className="block text-sm font-medium mb-1">ชื่อแบนเนอร์</label>
                <Input
                  placeholder="กรอกชื่อแบนเนอร์"
                  value={newTitle}
                  required
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <Input
  type="hidden"
  value={newPosition}
  onChange={(e) => setNewPosition(parseInt(e.target.value))}
                />
                <label className="block text-sm font-medium mb-1">เพิ่มรูป</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    setNewImage(file)
                    setNewPreview(URL.createObjectURL(file))
                  }}
                />

                {newPreview && (
                  <div className="transition cursor-pointer h-[300px]">
                    <img
                      src={newPreview}
                      alt="Preview"
                      className="mt-2 w-full h-full object-cover rounded-md shadow-md"
                    />
                  </div>
                )}
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
        <DialogContent className="sm:max-w-[425px] w-full max-h-[90vh] overflow-y-auto p-4 bg-white rounded-lg shadow-lg animate-fade-in">
          <DialogHeader>
            <DialogTitle>แก้ไขแบนเนอร์</DialogTitle>
            <DialogDescription>แก้ไขข้อมูลแบนเนอร์ของคุณที่นี่</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateBanner}>
            <div className="space-y-2 py-2">
              <label className="block text-sm font-medium mb-1">ชื่อแบนเนอร์</label>
              <Input
                placeholder="กรอกชื่อแบนเนอร์"
                value={editTitle}
                required
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <label className="block text-sm font-medium mb-1">รูปภาพ</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    setEditImage(file)
                    setEditPreview(file)
                  }
                }}
              />

              {editPreview && (
                <img
                  src={
                    typeof editPreview === "string"
                      ? editPreview.startsWith("http")
                        ? editPreview
                        : `${import.meta.env.VITE_UPLOAD_BASE}/${editPreview}`
                      : URL.createObjectURL(editPreview)
                  }
                  alt="Preview"
                  className="mt-2 w-full h-60 object-cover rounded-md shadow-md"
                />
              )}
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
        <DialogContent className="sm:max-w-[425px] bg-white rounded-md p-4 animate-fade-in">
          <DialogHeader>
            <DialogTitle>คุณแน่ใจหรือไม่?</DialogTitle>
            <DialogDescription>การดำเนินการนี้ไม่สามารถกู้คืนได้</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">ยกเลิก</Button>
            </DialogClose>
            <Button className="bg-red-600 text-white" onClick={handleConfirmDelete}>
              ลบ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table */}
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
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={data.map(b => b.banner_id.toString())} strategy={verticalListSortingStrategy}>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map(row => (
                    <DraggableRow key={row.id} row={row}>
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id} className="px-4 py-2">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </DraggableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">ไม่มีข้อมูล</TableCell>
                  </TableRow>
                )}
              </SortableContext>
            </DndContext>
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500 py-4">
        <div>หน้า {page} จาก {totalPages}</div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => fetchBanners(page - 1)} disabled={page <= 1}>
            ก่อนหน้า
          </Button>
          <Button variant="outline" size="sm" onClick={() => fetchBanners(page + 1)} disabled={page >= totalPages}>
            ถัดไป
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DataBanner
