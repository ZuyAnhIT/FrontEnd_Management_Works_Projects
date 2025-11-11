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
  Crown,
  Sparkles,
  Zap,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import UserMenu from "@/components/ui/UserMenu";
import { useAuth } from "@/context/AuthContext"; // 1. Import useAuth

interface HeaderProps {
  onMenuToggle: () => void;
  // ❌ Xóa prop user
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // 2. Lấy user và hàm logout từ Context
  const { user, role, logout } = useAuth();

  // 3. Logic kiểm tra quyền dựa trên Context, không phải URL
  const isCompanyAdminPage = pathname?.startsWith("/admin/company");
  // const isCompanyAdminRole = role === 'COMPANY_ADMIN'; // Chính xác hơn

  const handleGoCompany = () => {
    router.push("/admin/company/dashboard");
  };

  const handleGoBack = () => {
    router.push("/admin");
  };

  // 4. Hàm logout gọi Context
  const handleLogout = () => {
    logout(); // Chỉ cần gọi
  };

  // Đảm bảo user không null (mặc dù layout đã check)
  const safeUser = {
    name: user?.fullName || "Người dùng",
    email: user?.email || "Không có email",
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
      {/* Main Header Content */}
      <div className="px-4 lg:px-6 py-3 flex items-center justify-between">
        {/* ===== LEFT SECTION ===== */}
        <div className="flex items-center gap-3">
          {/* 🔙 Back Button for Company Admin */}
          {isCompanyAdminPage ? (
            <button
              onClick={handleGoBack}
              // ... (code nút quay lại)
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Quay lại</span>
            </button>
          ) : (
            <>
              {/* 📱 Mobile Menu Toggle */}
              <button
                onClick={onMenuToggle}
                className="p-2.5 hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 rounded-xl transition-all duration-300 lg:hidden group"
              >
                <Menu className="w-5 h-5" />
              </button>
              {/* 🧭 Logo & Brand */}
              <div className="flex items-center gap-3 select-none group cursor-pointer">
                {/* ... (code logo) */}
                <div className="hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      WorkNet
                    </span>
                    <Crown className="w-4 h-4 text-yellow-500 animate-pulse" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    Admin Panel
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ===== RIGHT SECTION ===== */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* ... (Code Search Bar) ... */}

          {/* 🏢 Company Management Button */}
          {/* 5. Hiển thị nút dựa trên VAI TRÒ, không chỉ là trang */}
          {role === "COMPANY_ADMIN" && !isCompanyAdminPage && (
            <button
              onClick={handleGoCompany}
              className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl"
            >
              <Building2 className="w-4 h-4" />
              <span>Quản lý Công ty</span>
            </button>
          )}

          {/* ... (Code các nút VIP, Settings, Notification) ... */}

          {/* 👤 User Avatar with Status */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setUserMenuOpen((prev) => !prev);
              }}
              className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold"
            >
              {safeUser.name?.charAt(0)?.toUpperCase() || "N"}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
            </button>

            {userMenuOpen && (
              <UserMenu
                user={safeUser} // 6. Dùng user đã check
                onClose={() => setUserMenuOpen(false)}
                onLogout={handleLogout} // 7. Dùng hàm logout mới
              />
            )}
          </div>
        </div>
      </div>

      {/* ... (Code Mobile Search Overlay) ... */}
    </header>
  );
}
