"use client";
import { useState } from "react";
import InputField from "./InputField";
import PasswordField from "./PasswordField";
import { Mail, User } from "lucide-react";
import LoadingButton from "@/components/ui/LoadingButton";

export default function AuthFormRegister({ form, handleChange, isLoading }: any) {
  // ✅ Hai state riêng cho 2 ô mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <InputField
        label="Họ và tên"
        icon={<User className="w-4 h-4 text-gray-400" />}
        value={form.fullName}
        onChange={handleChange("fullName")}
        placeholder="Nguyễn Văn A"
        required
      />

      <InputField
        label="Email"
        icon={<Mail className="w-4 h-4 text-gray-400" />}
        type="email"
        value={form.email}
        onChange={handleChange("email")}
        placeholder="user@gmail.com"
        required
      />

      <PasswordField
        label="Mật khẩu"
        value={form.password}
        show={showPassword}
        toggle={() => setShowPassword((prev) => !prev)}
        onChange={handleChange("password")}
      />

      <PasswordField
        label="Xác nhận mật khẩu"
        value={form.confirmPassword}
        show={showConfirm}
        toggle={() => setShowConfirm((prev) => !prev)}
        onChange={handleChange("confirmPassword")}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 mt-2 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 transition disabled:opacity-60"
      >
        {isLoading ? "Đang xử lý..." : "Tạo Tài Khoản"}
      </button>
    </>
  );
}
