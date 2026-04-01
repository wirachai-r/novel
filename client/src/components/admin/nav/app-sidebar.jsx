import * as React from "react"

import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconCrown,
} from "@tabler/icons-react"

import { NavLink, Link } from "react-router-dom";

import NavMain from "@/components/admin/nav/nav-main"
import NavUser from "@/components/admin/nav/nav-user"
import NavDocuments from "@/components/admin/nav/nav-documents"
import NavSecondary from "@/components/admin/nav/nav-secondary"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "ผู้ดูแล",
    email: "admin@example.com",
    avatar: "/avatars/shadcn.jpg",
  },

  navSecondary: [
    { title: "การตั้งค่า", url: "#", icon: IconSettings },
    { title: "ช่วยเหลือ", url: "#", icon: IconHelp },
    { title: "ค้นหา", url: "#", icon: IconSearch },
  ],
}

const AppSidebar = (props) => {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 hover:bg-primary/0 active:bg-primary/0">
              <Link to={"/admin"}>
                <IconCrown className="!size-5" />
                <span className="text-base font-semibold">ผู้ดูแลระบบ</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain />
        <NavDocuments />
        <NavSecondary className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
