"use client"

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { readUserNovelCategory } from "@/api/admin"
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom"

const SectionCards = () => {
  const [counts, setCounts] = useState({
    users: 0,
    novels: 0,
    categories: 0,
  })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true)
        const res = await readUserNovelCategory()
        const data = res.data

        setCounts({
          users: data.totalUsers || 0,
          novels: data.totalNovels || 0,
          categories: data.totalCategories || 0,
        })
      } catch (err) {
        console.error(err)
        toast.error("ไม่สามารถดึงข้อมูลสถิติได้")
      } finally {
        setLoading(false)
      }
    }
    fetchCounts()
  }, [])

  if (loading) return <div className="p-4">กำลังโหลดสถิติ...</div>

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* ผู้ใช้ */}
      <Card
        className="cursor-pointer hover:shadow-lg transition"
        onClick={() => navigate("/admin/user")}
      >
        <CardHeader>
          <CardDescription>จำนวนผู้ใช้ทั้งหมด</CardDescription>
          <CardTitle className="text-2xl font-semibold">{counts.users.toLocaleString()}</CardTitle>
        </CardHeader>
      </Card>

      {/* นิยาย */}
      <Card
        className="cursor-pointer hover:shadow-lg transition"
        onClick={() => navigate("/admin/novel")}
      >
        <CardHeader>
          <CardDescription>จำนวนเรื่องนิยายทั้งหมด</CardDescription>
          <CardTitle className="text-2xl font-semibold">{counts.novels.toLocaleString()}</CardTitle>
        </CardHeader>
      </Card>

      {/* หมวดหมู่ */}
      <Card
        className="cursor-pointer hover:shadow-lg transition"
        onClick={() => navigate("/admin/category")}
      >
        <CardHeader>
          <CardDescription>จำนวนหมวดหมู่ทั้งหมด</CardDescription>
          <CardTitle className="text-2xl font-semibold">{counts.categories.toLocaleString()}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}

export default SectionCards
