"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

import { useLocation } from "react-router-dom";

const SiteHeader = () => {
  const location = useLocation()

  // กำหนดเส้นทาง (path) -> ชื่อหัวข้อ
  const titles = {
    "/writer": "แดชบอร์ด",
    "/writer/mynovel": "นิยายของฉัน",
  }

  // หัวข้อปัจจุบันตาม path
  const currentTitle = titles[location.pathname] || "นักเขียน"

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        
        {/* ปุ่มเปิด/ปิด Sidebar */}
        <SidebarTrigger className="-ml-1" />

        {/* เส้นคั่นแนวตั้ง */}
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        {/* ชื่อหัวข้อหน้า */}
        <h1 className="text-base font-medium">{currentTitle}</h1>

        {/* ปุ่มด้านขวา (ยังไม่ใช้งาน) */}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            {/* ไว้ใส่ลิงก์ GitHub หรือปุ่มอื่นๆ */}
          </Button>
        </div>
      </div>
    </header>
  )
}

export default SiteHeader
