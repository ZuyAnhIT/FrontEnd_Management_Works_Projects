"use client";

import AuthModal from "@/components/features/auth/AuthModal";
import { useRouter } from "next/navigation";

// Đây là một trang đăng nhập/đăng ký chuyên dụng.
// Nó có nền và nội dung, làm cho AuthModal (giờ là AuthCard)
// xuất hiện một cách chuyên nghiệp.

export default function AuthPage() {
  const router = useRouter();

  // Vì đây là một trang (page), "onClose" có nghĩa là
  // người dùng nhấn "X" để quay về trang chủ.
  const handleClose = () => {
    router.push("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-b from-white via-blue-50/40 to-white">
      {/* AuthModal được render ở đây.
        Nó vẫn dùng 'fixed' để che toàn màn hình,
        nhưng trang này cung cấp một background đẹp.
      */}
      <AuthModal isOpen={true} onClose={handleClose} />
    </div>
  );
}
