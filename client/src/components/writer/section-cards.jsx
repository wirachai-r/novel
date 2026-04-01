"use client"

import { useEffect, useState } from "react"
import { IconTrendingUp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { countNovelsByWriter } from "@/api/writer"
import useAuthStore from "@/store/novel-store"

const SectionCards = () => {
  const { user } = useAuthStore()
  const [totalNovels, setTotalNovels] = useState(0)
  const [loading, setLoading] = useState(true)

  // โหลดจำนวนรวมของนิยายที่ผู้เขียนสร้าง
  useEffect(() => {
    const fetchTotalNovels = async () => {
      if (!user?.user_id) return
      try {
        setLoading(true)
        const res = await countNovelsByWriter(user.user_id)
        setTotalNovels(res.data.totalNovels || 0)
      } catch (err) {
        console.error("โหลดจำนวนรวมของนิยายไม่สำเร็จ:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTotalNovels()
  }, [user])

  if (loading) return <div className="p-4">กำลังโหลดจำนวนรวมของนิยาย...</div>

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
      <Card>
        <CardHeader>
          <CardDescription>จำนวนรวมของนิยาย</CardDescription>
          <CardTitle className="text-2xl font-semibold">{totalNovels.toLocaleString()}</CardTitle>
          <CardAction>
          </CardAction>
        </CardHeader>
        <CardFooter className="text-sm">นิยายที่คุณสร้าง</CardFooter>
      </Card>
    </div>
  )
}

export default SectionCards
