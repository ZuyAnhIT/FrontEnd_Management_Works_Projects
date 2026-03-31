"use client";

import React, { useState } from "react";
import { Mail } from "lucide-react";

// Internal Components & Utils
import InputField from "./InputField";
import PasswordField from "./PasswordField";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { cn } from "@/lib/utils";

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

type AuthTab = "login" | "register" | "verify" | "forgot";

interface AuthFormLoginProps {
  form: {
    email: string;
    password: string;
  };
  handleChange: (field: "email" | "password") => (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  setTab: (tab: AuthTab) => void;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Thành phần biểu mẫu đăng nhập (Login Form).
 * Cung cấp giao diện nhập liệu tài khoản, tính năng ghi nhớ và chuyển đổi sang quên mật khẩu.
 */
export default function AuthFormLogin({
  form,
  handleChange,
  isLoading,
  setTab,
}: AuthFormLoginProps) {
  // ---------------------------------------------------------------------------
  // 1. STATE MANAGEMENT
  // ---------------------------------------------------------------------------
  const [showPassword, setShowPassword] = useState(false);

  // ---------------------------------------------------------------------------
  // 2. RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Khu vực nhập liệu chính */}
      <div className="space-y-4">
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

        {/* Nhập liệu Mật khẩu */}
        <PasswordField
          label="Password"
          value={form.password}
          show={showPassword}
          toggle={() => setShowPassword((prev) => !prev)}
          onChange={handleChange("password")}
          placeholder="Enter your password"
          autoComplete="current-password"
        />
      </div>

      {/* Tùy chọn mở rộng: Ghi nhớ & Quên mật khẩu */}
      <div className="flex justify-between items-center">
        <label className="flex items-center gap-2 cursor-pointer group select-none">
          <input
            id="remember-me"
            type="checkbox"
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer transition-all"
          />
          <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-700 transition-colors uppercase tracking-wider">
            Remember me
          </span>
        </label>

        <button
          type="button"
          onClick={() => setTab("forgot")}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest"
        >
          Forgot password?
        </button>
      </div>

      {/* Nút hành động chính */}
      <div className="pt-2">
        <LoadingButton
          text="Sign In"
          isLoading={isLoading}
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 shadow-md font-bold text-sm transition-all"
        />
      </div>

      {/* Chuyển hướng đăng ký (Footer nội bộ) */}
      <div className="pt-4 border-t border-slate-100 flex justify-center items-center gap-2">
        <span className="text-xs text-slate-400 font-medium">New to Worknet?</span>
        <button
          type="button"
          onClick={() => setTab("register")}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-all"
        >
          Create account
        </button>
      </div>
    </div>
  );
}