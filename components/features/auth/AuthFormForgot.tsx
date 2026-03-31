"use client";

import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Mail, AlertCircle, CheckCircle2 } from "lucide-react";

// Internal Components & Utils
import InputField from "./InputField";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { forgotPassword } from "@/services/apiAuth";
import { cn } from "@/lib/utils";

// =============================================================================
// INTERFACES
// =============================================================================

interface AuthFormForgotProps {
  form: { email: string };
  handleChange: (field: "email") => (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  setTab: (tab: string) => void;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Thành phần biểu mẫu yêu cầu khôi phục mật khẩu (Forgot Password Form).
 * Gửi email chứa liên kết đặt lại mật khẩu và hiển thị thông báo phản hồi.
 */
export default function AuthFormForgot({
  form,
  handleChange,
  isLoading: parentLoading,
  setTab,
}: AuthFormForgotProps) {
  const { t } = useTranslation();

  // ---------------------------------------------------------------------------
  // 1. STATE MANAGEMENT
  // ---------------------------------------------------------------------------
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // ---------------------------------------------------------------------------
  // 2. LOGIC HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Xử lý gửi email khôi phục mật khẩu qua API
   */
  const handleSendRequest = useCallback(async () => {
    // Kiểm tra định dạng email cơ bản trước khi gửi
    if (!form.email.trim()) {
      setFeedback({
        type: "error",
        message: "Please enter your registered email address",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await forgotPassword(form.email);

      setFeedback({
        type: "success",
        message: response?.message || "Check your inbox! We've sent you a password reset link.",
      });
    } catch (error: any) {
      setFeedback({
        type: "error",
        message: error.message || "Something went wrong. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [form.email]);

  // ---------------------------------------------------------------------------
  // 3. RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-400">
      
      {/* Khu vực hướng dẫn (Instruction) */}
      <div className="text-center pb-2">
        <p className="text-sm text-slate-500 leading-relaxed">
          Enter your email address and we&apos;ll send you instructions to reset your password.
        </p>
      </div>

      {/* Nhập liệu Email */}
      <div className="space-y-1">
        <InputField
          label="Email Address"
          icon={<Mail className="w-4 h-4 text-slate-400" />}
          type="email"
          value={form.email}
          onChange={handleChange("email")}
          placeholder="name@company.com"
          required
        />
      </div>

      {/* Trạng thái phản hồi (Feedback Area) */}
      {feedback && (
        <div
          className={cn(
            "flex items-start gap-3 p-4 rounded-xl border animate-in zoom-in-95 duration-200",
            feedback.type === "error"
              ? "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:border-red-800"
              : "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800"
          )}
        >
          {feedback.type === "error" ? (
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 opacity-80" />
          ) : (
            <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 opacity-80" />
          )}
          <div className="flex-1 text-sm font-medium leading-relaxed">
            {feedback.message}
          </div>
        </div>
      )}

      {/* Nút hành động */}
      <div className="pt-2">
        <LoadingButton
          type="button"
          isLoading={isSubmitting || parentLoading}
          onClick={handleSendRequest}
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 shadow-md font-bold"
          text="Send Reset Instructions"
        />
      </div>

      {/* Điều hướng quay lại */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
        <button
          type="button"
          onClick={() => setTab("login")}
          className="text-xs font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-all"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}