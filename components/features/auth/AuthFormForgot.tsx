"use client";

import { useState } from "react";
import InputField from "./InputField";
import { Mail } from "lucide-react";
import LoadingButton from "@/components/ui/LoadingButton";
// ⛔️ Sửa đường dẫn nếu cần
import { forgotPassword } from "@/services/apiAuth";

interface AuthFormForgotProps {
  form: { email: string }; // Chỉ cần email
  handleChange: (
    field: "email"
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  setTab: (tab: string) => void;
}

export default function AuthFormForgot({
  form,
  handleChange,
  isLoading,
  setTab,
}: AuthFormForgotProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  // ❌ Xóa state loading riêng, dùng isLoading từ AuthModal
  // const [loading, setLoading] = useState(false);
  // ❌ Xóa state 'step'

  const handleSendEmail = async () => {
    if (!form.email.trim()) {
      setMessage("Vui lòng nhập email hợp lệ.");
      setIsError(true);
      return;
    }

    try {
      setMessage(null);
      setIsError(false);
      // setLoading(true); // Tạm thời dùng prop isLoading từ cha
      // (Tuy nhiên, logic submit này nên ở AuthModal,
      // nhưng ta tạm giữ ở đây cho nhanh)

      const res = await forgotPassword(form.email);
      setMessage(
        res?.message || "Đã gửi liên kết. Vui lòng kiểm tra email (kể cả Spam)."
      );
      setIsError(false);

      // ❌ Không chuyển sang Step 2 nữa
      // setStep(2);
    } catch (error: any) {
      setMessage(error.message || "Gửi email thất bại. Thử lại sau.");
      setIsError(true);
    } finally {
      // setLoading(false);
    }
  };

  return (
    <div>
      {/* 🧩 Chỉ còn Step 1: Nhập email */}
      <InputField
        label="Email"
        icon={<Mail className="w-4 h-4 text-gray-400" />}
        type="email"
        value={form.email}
        onChange={handleChange("email")}
        placeholder="user@gmail.com"
        required
      />

      {/* ⛔️ Lưu ý:
        Để chuyên nghiệp, `isLoading` nên được truyền từ AuthModal.
        Bạn nên di chuyển logic `handleSendEmail` lên AuthModal
        giống như `handleSubmit` của Login/Register.
        
        Nhưng để "demo gấp" và giữ logic của bạn, chúng ta
        tạm thời gọi 1 hàm riêng ở đây.
        Chúng ta sẽ dùng `isLoading` của cha cho nút này.
      */}
      <LoadingButton
        type="button"
        isLoading={isLoading} // Dùng isLoading của cha
        onClick={handleSendEmail}
        className="w-full mt-4"
        text="Gửi liên kết đặt lại mật khẩu"
      />

      {/* 🎨 Hiển thị thông báo */}
      {message && (
        <div
          className={`mt-3 text-sm text-center p-3 rounded-lg ${
            isError ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
