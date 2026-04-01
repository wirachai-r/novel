"use client"

import * as React from "react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { NavLink, Link } from "react-router-dom";

import {
  IconSettings,
} from "@tabler/icons-react"

const NavSecondary = ({ ...props }) => {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          <NavLink to={"/admin/banner"} end>
            {({ isActive }) => (
              <SidebarMenuItem className="flex items-center gap-2 pb-1">
                <SidebarMenuButton
                  className={`${isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                    : "hover:bg-primary/5"}`}>
                  <IconSettings />
                  <span>ตั้งค่าแบนเนอร์</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </NavLink>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export default NavSecondary
