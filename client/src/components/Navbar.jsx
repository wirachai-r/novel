"use client";

import React, { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  IconBook,
  IconBooks,
  IconMenu2,
  IconUser,
  IconLogin2,
  IconLogout,
} from "@tabler/icons-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import useAuthStore from "@/store/novel-store";
import { toast } from "react-toastify";

const Navbar = () => {

  const { user, actionLogout, checkAuth, token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      checkAuth();
    }
  }, [token, checkAuth]);

  // ฟังก์ชันออกจากระบบ
  const handleLogout = () => {
    actionLogout();
    toast.success("ออกจากระบบสำเร็จ");
    navigate("/login");
  };

  return (
    <nav className="w-full bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* มือถือ: ปุ่มเมนู + โลโก้ */}
          <div className="flex items-center space-x-2 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <IconMenu2 />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <SheetHeader>
                  <SheetTitle>เมนู</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col mt-2 space-y-2 p-2">
                  <NavLink to={"/"} end>
                    {({ isActive }) => (
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${isActive ? "bg-primary text-primary-foreground" : ""}`}>
                        <IconBook />
                        นิยาย
                      </Button>
                    )}
                  </NavLink>
                  <NavLink to={"category"}>
                    {({ isActive }) => (
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${isActive ? "bg-primary text-primary-foreground" : ""}`}>
                        <IconBooks />
                        หมวดหมู่
                      </Button>
                    )}
                  </NavLink>
                </div>
              </SheetContent>
            </Sheet>

            <div className="font-bold text-xl text-gray-800">
              <NavLink to={"/"}>
                <img
                  src="/logo.png"
                  alt="MyNovelApp Logo"
                  className="h-15 w-auto mt-3"
                />
                {/* <img
                src="/661463035/novel/logo.png"
                alt="MyNovelApp Logo"
                className="h-15 w-auto mt-3"
              /> */}
              </NavLink>
            </div>
          </div>

          {/* เดสก์ท็อปเมนู */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink to={"/"}>
              <img
                src="/logo.png"
                alt="MyNovelApp Logo"
                className="h-25 w-auto mt-3"
              />
              {/* <img
                src="/661463035/novel/logo.png"
                alt="MyNovelApp Logo"
                className="h-25 w-auto mt-3"
              /> */}
            </NavLink>

            <NavLink to={"/"} end>
              {({ isActive }) => (
                <Button
                  variant="ghost"
                  className={`${isActive ? "bg-primary text-primary-foreground" : ""}`}>
                  <IconBook />
                  นิยาย
                </Button>
              )}
            </NavLink>

            <NavLink to={"category"}>
              {({ isActive }) => (
                <Button
                  variant="ghost"
                  className={`${isActive ? "bg-primary text-primary-foreground" : ""}`}>
                  <IconBooks />
                  หมวดหมู่
                </Button>
              )}
            </NavLink>
          </div>

          {/* ด้านขวา: ค้นหา + เข้าสู่ระบบ/ผู้ใช้ */}
          <div className="flex items-center space-x-2 ">
            <NavLink to={"search"} className={"w-full rounded-md p-2 hover:bg-gray-100"}>
              <div>
                <Search className="cursor-pointer text-gray-500" />
              </div>
            </NavLink>

            {/* เส้นแบ่ง */}
            <div className="text-gray-300">|</div>

            {/* เมนูผู้ใช้ */}
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <Avatar>
                  <AvatarFallback>
                    <IconUser />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mr-2">
                {user ? (
                  <>
                    <DropdownMenuLabel>บัญชีของฉัน</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {user.role === "admin" && (
                      <NavLink to={"/admin"}>
                        <DropdownMenuItem className={'mb-1'}>แดชบอร์ด</DropdownMenuItem>
                      </NavLink>
                    )}

                    {user.role === "writer" && (
                      <NavLink to={"/writer"}>
                        <DropdownMenuItem className={'mb-1'}>แดชบอร์ด</DropdownMenuItem>
                      </NavLink>
                    )}

                    <NavLink to={"profile"}>
                      {({ isActive }) => (
                        <DropdownMenuItem
                          className={`mb-1 ${isActive ? "bg-primary text-primary-foreground" : ""}`}>
                          โปรไฟล์
                        </DropdownMenuItem>
                      )}
                    </NavLink>

                    {user.role === "writer" && (
                      <NavLink to={"/writer/mynovel"}>
                        <DropdownMenuItem className={"mb-1"}>นิยายของฉัน</DropdownMenuItem>
                      </NavLink>
                    )}

                    <NavLink to={"follow"}>
                      {({ isActive }) => (
                        <DropdownMenuItem
                          className={`mb-1 ${isActive ? "bg-primary text-primary-foreground" : ""}`}>
                          การติดตาม
                        </DropdownMenuItem>
                      )}
                    </NavLink>

                    <DropdownMenuItem onClick={handleLogout}>
                      <IconLogout className="text-red-600" />
                      <div className="text-red-600">ออกจากระบบ</div>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <NavLink to={"login"}>
                    <DropdownMenuItem>
                      <IconLogin2 /> เข้าสู่ระบบ
                    </DropdownMenuItem>
                  </NavLink>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
