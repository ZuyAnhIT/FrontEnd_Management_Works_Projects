"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail, AlertCircle, CheckCircle2 } from "lucide-react";

import InputField from "./InputField";
import LoadingButton from "@/components/ui/LoadingButton";
import { forgotPassword } from "@/services/apiAuth";

// =============================================================================
// 1. INTERFACES
// =============================================================================

interface AuthFormForgotProps {
  form: { email: string };
  handleChange: (field: "email") => (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean; // Loading từ parent (nếu có)
  setTab: (tab: string) => void;
}

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

export default function AuthFormForgot({
  form,
  handleChange,
  isLoading: parentLoading,
  setTab,
}: AuthFormForgotProps) {
  const { t } = useTranslation();

  // --- STATE ---
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading cục bộ
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // --- HANDLERS ---

  const handleSendEmail = async () => {
    // 1. Validate đơn giản
    if (!form.email.trim()) {
      setFeedback({
        type: "error",
        message: "Please enter your email address.",
      });
      return;
    }

    // 2. Bắt đầu gọi API
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await forgotPassword(form.email);

      // 3. Thành công: Lấy message từ API hoặc fallback tiếng Anh
      setFeedback({
        type: "success",
        message: res?.message || "Password reset link sent! Please check your inbox.",
      });
      
    } catch (error: any) {
      // 4. Thất bại: Lấy message lỗi từ API
      setFeedback({
        type: "error",
        message: error.message || "Failed to send reset link. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER ---
  return (
    <div className="space-y-4">
      
      {/* Input Email */}
      <InputField
        label="Email Address"
        icon={<Mail className="w-4 h-4 text-gray-400" />}
        type="email"
        value={form.email}
        onChange={handleChange("email")}
        placeholder="name@company.com"
        required
      />

      {/* Submit Button */}
      <LoadingButton
        type="button"
        isLoading={isSubmitting || parentLoading}
        onClick={handleSendEmail}
        className="w-full mt-2"
        text="Send Reset Link"
      />

      {/* Feedback Message Area */}
      {feedback && (
        <div
          className={`flex items-start gap-2 text-sm p-3 rounded-lg animate-in fade-in slide-in-from-top-1 ${
            feedback.type === "error"
              ? "bg-red-50 text-red-700 border border-red-100"
              : "bg-blue-50 text-blue-700 border border-blue-100"
          }`}
        >
          {feedback.type === "error" ? (
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Navigation Link (Optional - Quay lại Login) */}
      <div className="text-center mt-4">
        <button
          onClick={() => setTab("login")}
          className="text-xs text-slate-500 hover:text-blue-600 hover:underline transition-colors"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}