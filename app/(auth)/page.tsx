"use client";

import { useRouter } from "next/navigation";
import AuthModal from "@/components/features/auth/AuthModal";

/**
 * Trang Auth (Đăng nhập/Đăng ký) chuyên biệt.
 * Trang này hoạt động như một wrapper để hiển thị AuthModal dưới dạng một trang đầy đủ
 * thay vì một popup đè lên nội dung khác.
 */
export default function AuthPage() {
  const router = useRouter();

  // Xử lý khi đóng modal: Quay về trang chủ
  const handleClose = () => {
    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-white via-blue-50/40 to-white">
      {/* Render AuthModal ở trạng thái luôn mở (isOpen=true).
        Giao diện sẽ hiển thị như một Card nằm giữa màn hình nhờ class của div bao ngoài.
      */}
      <AuthModal 
        isOpen={true} 
        onClose={handleClose} 
      />
    </div>
  );
}