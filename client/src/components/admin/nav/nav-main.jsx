"use client"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { NavLink, Link } from "react-router-dom";

import {
  IconDashboard,
  IconBook,
  IconBooks,
  IconUser,
} from "@tabler/icons-react"

const NavMain = () => {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>

          <NavLink to={"/admin"} end>
            {({ isActive }) => (
              <SidebarMenuItem className="flex items-center gap-2 pb-1">
                <SidebarMenuButton
                  className={`${isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                    : "hover:bg-primary/5"}`}>
                  <IconDashboard />
                  <span>แดชบอร์ด</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </NavLink>

          <NavLink to="user">
            {({ isActive }) => (
              <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton
                  className={`${isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                    : "hover:bg-primary/5"}`}>
                  <IconUser />
                  <span>ผู้ใช้งาน</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </NavLink>

          <NavLink to="novel">
            {({ isActive }) => (
              <SidebarMenuItem className="flex items-center gap-2 pb-1">
                <SidebarMenuButton
                  className={`${isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                    : "hover:bg-primary/5"}`}>
                  <IconBook />
                  <span>นิยาย</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </NavLink>

          <NavLink to="category">
            {({ isActive }) => (
              <SidebarMenuItem className="flex items-center gap-2 pb-1">
                <SidebarMenuButton
                  className={`${isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                    : "hover:bg-primary/5"}`}>
                  <IconBooks />
                  <span>หมวดหมู่</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </NavLink>

        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export default NavMain
