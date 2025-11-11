"use client";

import { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { User, LockKeyhole, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
// 💡 Giả sử bạn muốn dùng Header chính (tùy chọn, có thể xóa)
// import Header from "@/components/features/admin/Header";

// Menu cho trang Cài đặt
const settingsNav = [
  {
    name: "Hồ sơ cá nhân",
    href: "/settings/profile",
    icon: User,
  },
  {
    name: "Tài khoản & Mật khẩu",
    href: "/settings/account",
    icon: LockKeyhole,
  },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth(); // Lấy user từ context

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Guard: Nếu chưa đăng nhập, AuthContext sẽ tự động chuyển hướng
  if (!user) return null;

  return (
    // 1. 🎨 Nền màu xám để làm nổi bật nội dung
    <div className="min-h-screen bg-slate-50">
      {/* Tùy chọn: Bạn có thể thêm Header chính của app (admin/core) vào đây 
          nếu muốn nó xuất hiện trên trang Cài đặt */}
      {/* <Header onMenuToggle={() => {}} /> */}

      {/* 2. Container chính */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Tiêu đề chung & Nút quay lại */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cài đặt</h1>
            <p className="text-gray-500 mt-1">
              Quản lý thông tin tài khoản của bạn, {user.fullName}.
            </p>
          </div>
          <button
            onClick={() => router.back()} // Quay lại trang trước đó
            className="group flex items-center gap-2 px-4 py-2 rounded-xl text-gray-700 hover:bg-white transition-all duration-300 shadow-sm border"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
            <span className="hidden sm:inline font-medium">Quay lại</span>
          </button>
        </div>

        {/* 3. Bố cục 2 cột (Menu và Nội dung) */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* 🎨 Menu Cài đặt (Layout) */}
          <nav className="flex-shrink-0 w-full md:w-64">
            <ul className="space-y-2">
              {settingsNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold 
                                  transition-all duration-200 ease-in-out
                                  ${
                                    isActive
                                      ? "bg-white text-blue-600 shadow-lg border border-gray-200" // 🎨 Nổi bật khi Active
                                      : "text-gray-600 hover:text-gray-900 hover:bg-white/70"
                                  }`}
                    >
                      <item.icon
                        className={`w-5 h-5 ${
                          isActive ? "text-blue-500" : "text-gray-400"
                        }`}
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* 4. 🎨 Nội dung trang (Tách biệt) */}
          <div className="flex-1 min-w-0">
            {/* 'children' (tức là ProfilePage/AccountPage) sẽ được render ở đây.
              Các trang đó BÂY GIỜ chỉ cần return cái thẻ <div bg-white...>
            */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
