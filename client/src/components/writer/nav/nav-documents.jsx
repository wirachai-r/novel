"use client"

import { IconBook, IconDashboard } from "@tabler/icons-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useNavigate, useLocation } from "react-router-dom"

import { NavLink, Link } from "react-router-dom";

const menuItems = [
  { path: "/writer", label: "Dashboard", icon: <IconDashboard /> },
  { path: "/writer/mynovel", label: "MyNovel", icon: <IconBook /> },
]

const NavDocuments = () => {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const location = useLocation() // ใช้เช็ค path ปัจจุบัน

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Documents</SidebarGroupLabel>
      <SidebarMenu>
        {/* {menuItems.map((item) => {
          const isActive = location.pathname === item.path

          return (
            <SidebarMenuItem key={item.path} className="flex items-center gap-2 pb-1">
              <SidebarMenuButton
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 min-w-8 duration-200 ease-linear ${
                  isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                    : "hover:bg-primary/5"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })} */}
        <NavLink to="/writer/mynovel">
          {({ isActive }) => (
            <SidebarMenuItem className="flex items-center gap-2 pb-1">
              <SidebarMenuButton
                className={`${isActive
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                  : "hover:bg-primary/5"}`}>
                <IconBook />
                <span>นิยายของฉัน</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </NavLink>
      </SidebarMenu>
    </SidebarGroup>
  )
}

export default NavDocuments
