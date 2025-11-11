import { Suspense } from "react";
import ResetPasswordForm from "@/components/features/auth/ResetPasswordForm";
import Link from "next/link";

// Đây là trang "cha" chỉ để render layout và bọc Suspense
// (Bắt buộc phải có Suspense khi dùng useSearchParams ở component con)
export default function ResetPasswordPage() {
  return (
    // Dùng layout giống trang (auth)
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-white via-blue-50/40 to-white">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 font-bold text-xl select-none group mb-4"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center text-sm shadow-lg group-hover:scale-105 transition-transform">
          WN
        </div>
        <span className="text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
          WorkNet
        </span>
      </Link>

      {/* Thẻ Form chính */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <Suspense fallback={<div className="p-6 text-center">Đang tải...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
