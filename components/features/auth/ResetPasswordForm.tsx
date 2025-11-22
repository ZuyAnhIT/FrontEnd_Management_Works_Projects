"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import PasswordField from "./PasswordField";
import LoadingButton from "@/components/ui/LoadingButton";
// 1. Import Component đánh giá mật khẩu
import PasswordStrengthMeter from "@/components/ui/PasswordStrengthMeter";
import { resetPassword } from "@/services/apiAuth";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // 1. Tự động đọc token từ URL khi trang tải
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setMessage("Invalid or expired token.");
      setIsError(true);
    }
  }, [searchParams]);

  // 2. Xử lý submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMessage("Invalid token.");
      setIsError(true);
      return;
    }
    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setIsError(true);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setMessage("Passwords do not match.");
      setIsError(true);
      return;
    }

    try {
      setMessage(null);
      setIsError(false);
      setLoading(true);

      const res = await resetPassword({
        token: token,
        newPassword: newPassword,
      });

      setMessage(res?.message || "Password reset successfully!");
      setIsError(false);
      // Chuyển về trang đăng nhập sau 2 giây
      setTimeout(() => router.push("/"), 2000);
    } catch (error: any) {
      setMessage(error.message || "Token invalid or expired.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  if (!token && !message) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm font-medium">
        Verifying token...
      </div>
    );
  }

  return (
    <>
      {/* Header Minimalist */}
      <div className="bg-white border-b border-slate-100 px-6 py-8 flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm mb-4">
          <KeyRound className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Reset Password
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Create a new strong password for your account.
        </p>
      </div>

      {/* Form Content */}
      <form className="p-6 space-y-5" onSubmit={handleSubmit}>
        {/* Nhóm Mật khẩu mới & Thanh đánh giá */}
        <div className="space-y-3">
          <PasswordField
            label="New Password"
            value={newPassword}
            show={showPassword}
            toggle={() => setShowPassword(!showPassword)}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />

          {/* 2. 🔥 Chèn component đánh giá vào đây */}
          <PasswordStrengthMeter password={newPassword} />
        </div>

        <PasswordField
          label="Confirm Password"
          value={confirmNewPassword}
          show={showConfirm}
          toggle={() => setShowConfirm(!showConfirm)}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          placeholder="Re-enter password"
        />

        <div className="pt-2">
          <LoadingButton
            type="submit"
            isLoading={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 font-bold shadow-sm"
            text="Reset Password"
            loadingText="Resetting..."
          />
        </div>

        {/* Hiển thị thông báo (Alert Style) */}
        {message && (
          <div
            className={`mt-4 p-3 rounded-md flex items-start gap-3 text-sm font-medium border ${
              isError
                ? "bg-red-50 text-red-700 border-red-100"
                : "bg-green-50 text-green-700 border-green-100"
            }`}
          >
            {isError ? (
              <AlertCircle className="w-5 h-5 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            )}
            <span>{message}</span>
          </div>
        )}
      </form>
    </>
  );
}
