"use client";

import React, { useState } from "react";
import { Mail, User } from "lucide-react";

// Internal Components & Utils
import InputField from "./InputField";
import PasswordField from "./PasswordField";
import { LoadingButton } from "@/components/ui/LoadingButton";
import PasswordStrengthMeter from "@/components/ui/PasswordStrengthMeter";
import { cn } from "@/lib/utils";

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

interface RegisterFormState {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface AuthFormRegisterProps {
  form: RegisterFormState;
  /**
   * Hàm xử lý thay đổi dữ liệu đầu vào sử dụng kỹ thuật Currying
   */
  handleChange: (field: keyof RegisterFormState) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Biểu mẫu đăng ký tài khoản mới (Register Form).
 * Bao gồm các trường thông tin cơ bản, kiểm tra độ mạnh mật khẩu và xác nhận mật khẩu.
 */
export default function AuthFormRegister({ 
  form, 
  handleChange, 
  isLoading 
}: AuthFormRegisterProps) {
  
  // ---------------------------------------------------------------------------
  // 1. STATE MANAGEMENT
  // ---------------------------------------------------------------------------
  // Quản lý trạng thái hiển thị mật khẩu riêng biệt cho từng ô để tăng tính tiện dụng
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ---------------------------------------------------------------------------
  // 2. RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-400">
      
      {/* Khu vực nhập liệu chính */}
      <div className="space-y-4">
        
        {/* Nhập liệu Họ và Tên */}
        <InputField
          label="Full Name"
          icon={<User className="w-4 h-4 text-slate-400" />}
          value={form.fullName}
          onChange={handleChange("fullName")}
          placeholder="e.g. Alexander Pierce"
          required
          autoComplete="name"
        />

        {/* Nhập liệu Email */}
        <InputField
          label="Email Address"
          icon={<Mail className="w-4 h-4 text-slate-400" />}
          type="email"
          value={form.email}
          onChange={handleChange("email")}
          placeholder="name@company.com"
          required
          autoComplete="email"
        />

        {/* Nhập liệu Mật khẩu & Thước đo độ mạnh */}
        <div className="space-y-3">
          <PasswordField
            label="Create Password"
            value={form.password}
            show={showPassword}
            toggle={() => setShowPassword((prev) => !prev)}
            onChange={handleChange("password")}
            placeholder="Minimum 6 characters"
            autoComplete="new-password"
            required
          />
          {/* Hiển thị gợi ý độ an toàn khi người dùng bắt đầu nhập mật khẩu */}
          <PasswordStrengthMeter password={form.password} />
        </div>

        {/* Xác nhận lại mật khẩu */}
        <PasswordField
          label="Confirm Password"
          value={form.confirmPassword}
          show={showConfirm}
          toggle={() => setShowConfirm((prev) => !prev)}
          onChange={handleChange("confirmPassword")}
          placeholder="Repeat your password"
          autoComplete="new-password"
          required
        />
      </div>

      {/* Nút hành động chính */}
      <div className="pt-2">
        <LoadingButton
          text="Create Account"
          isLoading={isLoading}
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 shadow-md font-bold text-sm transition-all"
        />
      </div>

      {/* Thông tin hỗ trợ pháp lý hoặc chính sách (Tùy chọn cho Jira-style) */}
      <p className="text-[11px] text-slate-400 text-center leading-relaxed px-4">
        By signing up, you agree to our 
        <button className="text-blue-600 font-semibold mx-1 hover:underline">Terms of Service</button> 
        and 
        <button className="text-blue-600 font-semibold mx-1 hover:underline">Privacy Policy</button>.
      </p>
    </div>
  );
}