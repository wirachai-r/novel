import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // เช่น http://localhost/novel/server/api
  headers: {
    "Content-Type": "application/json",
  },
});

const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    display_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      toast.error("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/user/register.php", {
        firstname: formData.firstname,
        lastname: formData.lastname,
        display_name: formData.display_name,
        email: formData.email,
        password: formData.password,
      });

      toast.success(res.data.message || "สมัครสมาชิกสำเร็จ");

      setFormData({
        firstname: "",
        lastname: "",
        display_name: "",
        email: "",
        password: "",
        confirm_password: "",
      });

      if (res.status === 201) navigate("/login");
    } catch (err) {
      const errMsg = err.response?.data?.message || "เกิดข้อผิดพลาด";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">สร้างบัญชีใหม่</CardTitle>
        <CardDescription>สมัครสมาชิกด้วยอีเมลของคุณ</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-1">
              <Label htmlFor="firstname">ชื่อ</Label>
              <Input id="firstname" value={formData.firstname} onChange={handleChange} required />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="lastname">นามสกุล</Label>
              <Input id="lastname" value={formData.lastname} onChange={handleChange} required />
            </div>
          </div>

          <div className="grid gap-1">
            <Label htmlFor="display_name">ชื่อแสดง</Label>
            <Input id="display_name" value={formData.display_name} onChange={handleChange} required />
          </div>

          <div className="grid gap-1">
            <Label htmlFor="email">อีเมล</Label>
            <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="grid gap-1">
            <Label htmlFor="password">รหัสผ่าน</Label>
            <Input id="password" type="password" value={formData.password} onChange={handleChange} required />
          </div>

          <div className="grid gap-1">
            <Label htmlFor="confirm_password">ยืนยันรหัสผ่าน</Label>
            <Input id="confirm_password" type="password" value={formData.confirm_password} onChange={handleChange} required />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
          </Button>

          <p className="text-center text-sm mt-4">
            มีบัญชีแล้ว?{" "}
            <NavLink to="/login" className="underline underline-offset-4">
              เข้าสู่ระบบ
            </NavLink>
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
