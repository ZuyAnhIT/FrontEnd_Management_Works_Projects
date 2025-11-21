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
        label="Full Name"
        icon={<User className="w-4 h-4 text-gray-400" />}
        value={form.fullName}
        onChange={handleChange("fullName")}
        placeholder="John Doe"
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
        label="Password"
        value={form.password}
        show={showPassword}
        toggle={() => setShowPassword((prev) => !prev)}
        onChange={handleChange("password")}
      />

      <PasswordField
        label="Confirm Password"
        value={form.confirmPassword}
        show={showConfirm}
        toggle={() => setShowConfirm((prev) => !prev)}
        onChange={handleChange("confirmPassword")}
      />

      {/* Sử dụng LoadingButton thay cho button thường để đồng bộ UI */}
      <LoadingButton
        text="Create Account"
        isLoading={isLoading}
        className="w-full mt-4"
      />
    </>
  );
}