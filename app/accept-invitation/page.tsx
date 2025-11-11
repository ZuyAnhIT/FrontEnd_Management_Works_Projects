import { Suspense } from "react";
import AcceptInvitationClient from "@/components/features/auth/AcceptInvitationClient";
import Link from "next/link";
import { Loader2 } from "lucide-react"; // ✅ THÊM DÒNG NÀY

// Trang "cha" bọc Suspense và cung cấp layout
export default function AcceptInvitationPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-white via-blue-50/40 to-white">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 font-bold text-xl select-none group mb-4"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center text-sm shadow-lg">
          WN
        </div>
        <span className="text-gray-900 tracking-tight">WorkNet</span>
      </Link>

      {/* Thẻ (Card) chính */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <Suspense
          fallback={
            <div className="p-8 text-center flex items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" /> Đang tải...
            </div>
          }
        >
          <AcceptInvitationClient />
        </Suspense>
      </div>
    </div>
  );
}
