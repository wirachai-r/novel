"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  updateUserRole,
} from "@/api/user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import useAuthStore from "@/store/novel-store";
import { toast } from "react-toastify";

const ProfileDetail = () => {
  const { user, checkAuth, token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) checkAuth();
  }, [token, checkAuth]);

  const userId = user?.user_id;

  const [profile, setProfile] = useState({
    firstname: "",
    lastname: "",
    display_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const res = await getUserProfile(userId);
        setProfile((prev) => ({
          ...prev,
          firstname: res.data.firstname || "",
          lastname: res.data.lastname || "",
          display_name: res.data.display_name || "",
          email: res.data.email || "",
        }));
      } catch {
        toast.error("ไม่สามารถโหลดข้อมูลโปรไฟล์ได้");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.id]: e.target.value });
  };

  const handleProfileSave = async () => {
    try {
      const res = await updateUserProfile(userId, profile);
      toast.success(res.data.message || "อัปเดตโปรไฟล์เรียบร้อยแล้ว");
    } catch (err) {
      toast.error(err.response?.data?.message || "ไม่สามารถอัปเดตโปรไฟล์ได้");
    }
  };

  const handlePasswordSave = async () => {
    if (!profile.password) return toast.error("รหัสผ่านห้ามว่าง");
    if (profile.password !== profile.confirm_password)
      return toast.error("รหัสผ่านไม่ตรงกัน");

    try {
      const res = await updateUserPassword(userId, profile.password);
      toast.success(res.data.message || "เปลี่ยนรหัสผ่านสำเร็จ");
      setProfile({ ...profile, password: "", confirm_password: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
    }
  };

  if (loading) return <div className="text-center py-6">กำลังโหลด...</div>;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <button
                onClick={() => navigate("/")}
                className="hover:text-gray-900"
              >
                หน้าแรก
              </button>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <button
                onClick={() => navigate("/profile")}
                className="hover:text-gray-900"
              >
                โปรไฟล์
              </button>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Profile Card */}
      <Card className="w-full mx-auto rounded-2xl shadow-md border border-gray-100 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="flex flex-col md:flex-row gap-8 p-8">
          {/* LEFT SIDE */}
          <div className="md:w-1/3 flex flex-col items-center text-center space-y-4 border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0 md:pr-6">

            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-2  border-4 border-white">
              <span className="text-gray-500 text-5xl">{profile.display_name?.[0] || "?"}</span>
            </div>
            
            <CardTitle className="text-2xl font-bold text-gray-800 mt-2">
              {profile.display_name || "ไม่ระบุชื่อ"}
            </CardTitle>
            <p className="text-gray-500">{profile.email}</p>
          </div>

          {/* RIGHT SIDE */}
          <div className="md:w-2/3 flex flex-col justify-between space-y-6">
            {/* Personal Info */}
            {/* Personal Info */}
            <div className="grid gap-3 text-gray-700">
              <p className="flex items-center justify-between ">
                <span className="font-semibold">ชื่อจริง</span>
                <span>{profile.firstname || "-"}</span>
              </p>
              <p className="flex items-center justify-between ">
                <span className="font-semibold">นามสกุล</span>
                <span>{profile.lastname || "-"}</span>
              </p>
              <p className="flex items-center justify-between ">
                <span className="font-semibold">สิทธิ์ผู้ใช้</span>
                <span className="capitalize">
                  {user?.role === "admin"
                    ? "ผู้ดูแลระบบ"
                    : user?.role === "writer"
                      ? "นักเขียน"
                      : "ผู้ใช้งานทั่วไป"}
                </span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              {/* Edit Profile Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-md shadow-sm hover:shadow-md">
                    แก้ไขข้อมูล
                  </Button>
                </DialogTrigger>
                <DialogContent className="animate-fade-in"
                  style={{
                    animationDuration: "0.2s",
                    animationFillMode: "forwards",
                  }}>
                  <DialogHeader>
                    <DialogTitle>แก้ไขโปรไฟล์</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-3">
                    <Label htmlFor="firstname">ชื่อจริง</Label>
                    <Input
                      id="firstname"
                      value={profile.firstname}
                      onChange={handleChange}
                    />
                    <Label htmlFor="lastname">นามสกุล</Label>
                    <Input
                      id="lastname"
                      value={profile.lastname}
                      onChange={handleChange}
                    />
                    <Label htmlFor="display_name">ชื่อที่แสดง</Label>
                    <Input
                      id="display_name"
                      value={profile.display_name}
                      onChange={handleChange}
                    />
                    <Label htmlFor="email">อีเมล</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={handleChange}
                    />
                  </div>
                  <DialogFooter className="mt-4">
                    <DialogClose asChild>
                      <Button variant="outline">ยกเลิก</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button onClick={handleProfileSave}>บันทึก</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Change Password Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-md shadow-sm hover:shadow-md">
                    เปลี่ยนรหัสผ่าน
                  </Button>
                </DialogTrigger>
                <DialogContent className="animate-fade-in"
                  style={{
                    animationDuration: "0.2s",
                    animationFillMode: "forwards",
                  }}>
                  <DialogHeader>
                    <DialogTitle>เปลี่ยนรหัสผ่าน</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-3">
                    <Label htmlFor="password">รหัสผ่านใหม่</Label>
                    <Input
                      id="password"
                      type="password"
                      value={profile.password}
                      onChange={handleChange}
                    />
                    <Label htmlFor="confirm_password">ยืนยันรหัสผ่าน</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={profile.confirm_password}
                      onChange={handleChange}
                    />
                  </div>
                  <DialogFooter className="mt-4">
                    <DialogClose asChild>
                      <Button variant="outline">ยกเลิก</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button onClick={handlePasswordSave}>อัปเดต</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Apply Writer Role */}
      <div className="mt-6 w-full">
        {user?.role === "user" && (
          <Dialog>
            <DialogTrigger asChild>
              <div className="flex flex-row items-center justify-center space-x-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100 transition px-4 py-3">
                <span className="text-gray-600 font-bold">สมัครนักเขียน</span>
              </div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg w-full p-4 bg-white rounded-lg shadow-lg animate-fade-in"
              style={{ animationDuration: "0.2s", animationFillMode: "forwards" }}>
              <DialogHeader>
                <DialogTitle>ยืนยันการสมัครเป็นนักเขียน</DialogTitle>
                <DialogDescription>
                  คุณต้องการสมัครเป็นนักเขียนใช่หรือไม่? โปรดยืนยันว่าคุณยินยอมปฏิบัติตามกฎและเงื่อนไขของเว็บไซต์
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-2">
                <p>การสมัครนักเขียนจะเปิดสิทธิ์ในการสร้างและเผยแพร่นิยายของคุณ</p>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" id="agreeTerms" />
                  <span>ฉันยินยอมและยอมรับกฎระเบียบของเว็บไซต์</span>
                </label>
              </div>

              <DialogFooter className="mt-4 flex justify-end space-x-2">
                <DialogClose asChild>
                  <div className="px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-100 transition">
                    ยกเลิก
                  </div>
                </DialogClose>
                <div
                  onClick={async () => {
                    if (!userId) return toast.error("ไม่พบผู้ใช้งาน");
                    const checkbox = document.getElementById("agreeTerms");
                    if (!checkbox?.checked) {
                      toast.error("คุณต้องยืนยันว่าตกลงกฎก่อนสมัครนักเขียน");
                      return;
                    }

                    try {
                      await updateUserRole(userId, "writer");
                      toast.success("คุณได้สมัครนักเขียนเรียบร้อยแล้ว");
                      await checkAuth();
                      document.querySelector("[role='dialog'] button[aria-label='Close']")?.click();
                    } catch (err) {
                      console.error(err);
                      toast.error(err.response?.data?.message || "ไม่สามารถสมัครนักเขียนได้");
                    }
                  }}
                  className="flex flex-row items-center justify-center space-x-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100 transition p-2"
                >
                  <span className="text-gray-600 font-medium">ยืนยันสมัคร</span>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {(user?.role === "writer" || user?.role === "admin") && (
          <div
            onClick={() => navigate(user.role === "admin" ? "/admin" : "/writer")}
            className="flex flex-row items-center justify-center space-x-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100 transition px-4 py-3">

            {user.role === "admin" ? "ผู้ดูแลระบบ" : "นักเขียน"}
          </div>
        )}
      </div>

    </div>
  );
};

export default ProfileDetail;
