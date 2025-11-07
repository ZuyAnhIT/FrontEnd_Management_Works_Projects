"use client";

import { useState } from "react";
import {
  Menu,
  Bell,
  LayoutDashboard,
  Search,
  Settings,
  Building2,
  ArrowLeft,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import UserMenu from "@/components/ui/UserMenu";

interface HeaderProps {
  onMenuToggle: () => void;
  user: {
    name: string;
    email: string;
  };
}

export default function Header({ onMenuToggle, user }: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // ✅ Kiểm tra xem có đang ở trang quản lý công ty không
  const isCompanyAdmin = pathname?.startsWith("/admin/company");

  const handleGoCompany = () => {
    router.push("/admin/company/dashboard");
  };

  const handleGoBack = () => {
    router.push("/admin");
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      {/* ===== LEFT SIDE ===== */}
      <div className="flex items-center gap-3">
        {/* 🔙 Nếu đang ở admin/company thì hiện nút quay lại */}
        {isCompanyAdmin ? (
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline font-medium">Quay lại</span>
          </button>
        ) : (
          <>
            {/* 📱 Toggle menu (mobile) */}
            <button
              onClick={onMenuToggle}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* 🧭 Logo */}
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-blue-600" />
              <span className="font-semibold text-lg">WorkNet VIP</span>
            </div>
          </>
        )}
      </div>

      {/* ===== RIGHT SIDE ===== */}
      <div className="flex items-center gap-3">
        {/* 🔍 Search bar */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* 🏢 Nếu chưa ở admin/company thì hiện nút “Quản lý Công ty” */}
        {!isCompanyAdmin && (
          <button
            onClick={handleGoCompany}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="Quản lý công ty"
          >
            <Building2 className="w-4 h-4 text-gray-700" />
            <span className="font-medium text-gray-700">Quản lý Công ty</span>
          </button>
        )}

        {/* 🔔 Thông báo */}
        <button
          className="relative p-2 hover:bg-gray-100 rounded-lg"
          aria-label="Thông báo"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* 👤 Avatar */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setUserMenuOpen((prev) => !prev);
            }}
            className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            {user?.name?.charAt(0) || "N"}
          </button>

          {userMenuOpen && (
            <UserMenu
              user={user}
              onClose={() => setUserMenuOpen(false)}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>
    </header>
  );
}
