"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

// Thư viện bên ngoài
import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

// Internal Services & Contexts
import { resetPassword } from "@/services/apiAuth";

// Internal UI Components
import PasswordField from "./PasswordField";
import { LoadingButton } from "@/components/ui/LoadingButton";
import PasswordStrengthMeter from "@/components/ui/PasswordStrengthMeter";

// Internal Utils
import { cn } from "@/lib/utils";

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

/**
 * Biểu mẫu đặt lại mật khẩu (Reset Password Form).
 * Xác thực token từ URL và cho phép người dùng thiết lập mật khẩu mới.
 */
export default function ResetPasswordForm() {
  // ---------------------------------------------------------------------------
  // 3. HOOKS & STATE
  // ---------------------------------------------------------------------------
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Trạng thái dữ liệu
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Trạng thái hiển thị
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Trạng thái xử lý và phản hồi
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  /**
   * Khởi tạo: Trích xuất và kiểm tra token bảo mật từ đường dẫn URL
   */
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setFeedback({ 
        type: "error", 
        message: "The password reset link is invalid or has expired" 
      });
    }
  }, [searchParams]);

  // ---------------------------------------------------------------------------
  // 4. HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Xử lý gửi yêu cầu đặt lại mật khẩu mới
   */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // 1. Kiểm tra tính hợp lệ cơ bản (Client-side Validation)
    if (!token) {
      setFeedback({ type: "error", message: "Security token is missing" });
      return;
    }
    if (newPassword.length < 6) {
      setFeedback({ type: "error", message: "Password must be at least 6 characters" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: "error", message: "Confirmation password does not match" });
      return;
    }

    // 2. Thực hiện gọi API xác thực mật khẩu mới
    setIsLoading(true);
    try {
      const response = await resetPassword({
        token,
        newPassword,
      });

      // 3. Xử lý phản hồi thành công
      setFeedback({ 
        type: "success", 
        message: response?.message || "Password updated! Redirecting to login..." 
      });

      // Tự động chuyển hướng về trang chủ/đăng nhập sau khi hoàn tất
      setTimeout(() => router.push("/"), 2500);

    } catch (error: any) {
      // 4. Xử lý phản hồi lỗi từ phía Backend
      setFeedback({ 
        type: "error", 
        message: error.message || "Failed to reset password. Please request a new link." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 5. RENDER LOGIC
  // ---------------------------------------------------------------------------

  // Trạng thái chờ kiểm tra Token
  if (!token && !feedback) {
    return (
      <div className="p-16 text-center flex flex-col items-center gap-4 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">
          Verifying security token...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      
      {/* Khu vực tiêu đề biểu mẫu */}
      <div className="bg-white border-b border-slate-100 px-8 py-10 flex flex-col items-center text-center">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 mb-6">
          <KeyRound className="w-7 h-7 text-white stroke-[2.5px]" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Reset Password
        </h2>
        <p className="text-sm text-slate-500 mt-2 max-w-[240px]">
          Create a new strong password to regain access to your account.
        </p>
      </div>

      {/* Khu vực nội dung biểu mẫu */}
      <div className="p-8">
        <form className="space-y-6" onSubmit={handleFormSubmit}>
          
          {/* Mật khẩu mới và thước đo độ mạnh */}
          <div className="space-y-3">
            <PasswordField
              label="New Password"
              value={newPassword}
              show={showPassword}
              toggle={() => setShowPassword(!showPassword)}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              required
            />
            <PasswordStrengthMeter password={newPassword} />
          </div>

          {/* Xác nhận mật khẩu mới */}
          <PasswordField
            label="Confirm New Password"
            value={confirmPassword}
            show={showConfirm}
            toggle={() => setShowConfirm(!showConfirm)}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat new password"
            autoComplete="new-password"
            required
          />

          {/* Nút thực hiện tác vụ */}
          <div className="pt-2">
            <LoadingButton
              type="submit"
              isLoading={isLoading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 shadow-md font-bold text-sm"
              text="Update Password"
            />
          </div>

          {/* Khu vực thông báo phản hồi (Alert Feedback) */}
          {feedback && (
            <div
              className={cn(
                "p-4 rounded-xl flex items-start gap-3 text-sm font-medium border animate-in zoom-in-95 duration-200",
                feedback.type === "error"
                  ? "bg-red-50 text-red-700 border-red-100"
                  : "bg-green-50 text-green-700 border-green-100"
              )}
            >
              {feedback.type === "error" ? (
                <AlertCircle className="w-5 h-5 shrink-0 opacity-80" />
              ) : (
                <CheckCircle2 className="w-5 h-5 shrink-0 opacity-80" />
              )}
              <span className="leading-relaxed">{feedback.message}</span>
            </div>
          )}
        </form>

        {/* Chuyển hướng thủ công nếu cần */}
        {!isLoading && feedback?.type === "error" && (
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button
              onClick={() => router.push("/")}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}