"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

import { Link, useLocation } from "react-router-dom";

const SiteHeader = () => {
  const location = useLocation()

  // map path -> title (ภาษาไทย)
  const titles = {
    "/admin": "แดชบอร์ด",
    "/admin/novel": "นิยาย",
    "/admin/user": "ผู้ใช้งาน",
    "/admin/category": "หมวดหมู่",
    "/admin/mynovel": "นิยายของฉัน",
    "/admin/banner": "ตั้งค่าแบนเนอร์",
  }

  const currentTitle = titles[location.pathname] || "แดชบอร์ดผู้ดูแลระบบ"

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{currentTitle}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            {/* สามารถเพิ่มลิงก์อื่น ๆ ได้ที่นี่ */}
          </Button>
        </div>
      </div>
    </header>
  )
}

export default SiteHeader
