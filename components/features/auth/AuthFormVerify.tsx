"use client";

import React from "react";
import { Lock, RefreshCw } from "lucide-react";

// Internal Components & Utils
import InputField from "./InputField";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { cn } from "@/lib/utils";

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

interface VerifyFormState {
  otp: string;
}

interface AuthFormVerifyProps {
  form: VerifyFormState;
  /**
   * Hàm xử lý thay đổi dữ liệu sử dụng kỹ thuật Currying
   */
  handleChange: (field: keyof VerifyFormState) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  onResend?: () => void; // Thêm callback tùy chọn cho việc gửi lại mã
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Biểu mẫu xác thực mã OTP (Verification Form).
 * Dùng để xác nhận email sau khi đăng ký hoặc xác minh danh tính.
 */
export default function AuthFormVerify({ 
  form, 
  handleChange, 
  isLoading,
  onResend
}: AuthFormVerifyProps) {
  
  // ---------------------------------------------------------------------------
  // 2. RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-400">
      
      {/* Thông tin hướng dẫn */}
      <div className="text-center pb-2">
        <p className="text-sm text-slate-500 leading-relaxed">
          Please enter the 6-digit code sent to your email address to verify your account.
        </p>
      </div>

      {/* Trường nhập mã xác thực */}
      <div className="space-y-4">
        <InputField
          label="Verification Code"
          icon={<Lock className="w-4 h-4 text-slate-400" />}
          type="text"
          value={form.otp}
          onChange={handleChange("otp")}
          placeholder="Enter 6-digit code"
          required
          maxLength={6}
          autoFocus
          autoComplete="one-time-code" // Hỗ trợ tự động điền OTP trên mobile/browser
          className="text-center text-lg tracking-[0.5em] font-bold placeholder:tracking-normal placeholder:font-medium placeholder:text-sm"
        />
      </div>

      {/* Nút hành động chính */}
      <div className="pt-2">
        <LoadingButton
          text="Verify Email"
          isLoading={isLoading}
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 shadow-md font-bold text-sm transition-all"
        />
      </div>

      {/* Khu vực gửi lại mã (Resend Logic) */}
      <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-2">
        <span className="text-xs text-slate-400 font-medium">
          Didn&apos;t receive the code?
        </span>
        <button
          type="button"
          onClick={onResend}
          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-all"
        >
          <RefreshCw className="w-3 h-3" />
          Resend OTP
        </button>
      </div>
    </div>
  );
}