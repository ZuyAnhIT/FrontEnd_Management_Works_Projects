"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* 🔙 Header nhỏ với nút quay lại */}
      <header className="w-full bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium hidden sm:inline">Quay lại</span>
        </button>

        <h1 className="text-lg font-semibold text-gray-800">Cài đặt tài khoản</h1>

        {/* Giữ khoảng trống cho cân đối */}
        <div className="w-5 sm:w-16" />
      </header>

      {/* 📄 Nội dung chính */}
      <main className="flex-1 w-full max-w-2xl mx-auto p-6">{children}</main>
    </div>
  );
}
