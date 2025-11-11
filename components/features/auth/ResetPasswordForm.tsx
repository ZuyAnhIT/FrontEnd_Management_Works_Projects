"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import PasswordField from "./PasswordField";
import LoadingButton from "@/components/ui/LoadingButton";
import { useToast } from "@/components/ui/ToastProvider";
// ⛔️ Sửa đường dẫn nếu cần
import { resetPassword } from "@/services/apiAuth";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

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
      setMessage("Token không hợp lệ hoặc đã hết hạn.");
      setIsError(true);
    }
  }, [searchParams]);

  // 2. Xử lý submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMessage("Token không hợp lệ.");
      setIsError(true);
      return;
    }
    if (newPassword.length < 6) {
      setMessage("Mật khẩu mới phải có ít nhất 6 ký tự.");
      setIsError(true);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setMessage("Mật khẩu xác nhận không khớp.");
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

      setMessage(res?.message || "Đặt lại mật khẩu thành công!");
      setIsError(false);
      // Chuyển về trang đăng nhập sau 2 giây
      setTimeout(() => router.push("/log-in-out"), 2000);
    } catch (error: any) {
      setMessage(error.message || "Token không hợp lệ hoặc đã hết hạn.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  if (!token && !message) {
    return <div className="p-6 text-center">Đang xác thực token...</div>;
  }

  return (
    <>
      {/* Header riêng của trang */}
      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-center py-6 px-4 relative">
        <h2 className="text-lg sm:text-xl font-bold text-white mt-3">
          Tạo Mật khẩu mới
        </h2>
        <p className="text-xs text-blue-100 mt-1">
          Nhập mật khẩu mới cho tài khoản của bạn.
        </p>
      </div>

      {/* Form */}
      <form className="p-5 space-y-3" onSubmit={handleSubmit}>
        <PasswordField
          label="Mật khẩu mới"
          value={newPassword}
          show={showPassword}
          toggle={() => setShowPassword(!showPassword)}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <PasswordField
          label="Xác nhận mật khẩu mới"
          value={confirmNewPassword}
          show={showConfirm}
          toggle={() => setShowConfirm(!showConfirm)}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
        />

        <LoadingButton
          type="submit"
          isLoading={loading}
          className="w-full mt-4"
          text="Đặt lại mật khẩu"
        />

        {/* Hiển thị thông báo */}
        {message && (
          <div
            className={`mt-3 text-sm text-center p-3 rounded-lg ${
              isError ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </>
  );
}
