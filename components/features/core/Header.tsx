"use client";

import { useState } from "react";
import {
  Menu,
  Bell,
  LayoutDashboard,
  Search,
  Settings,
  ArrowLeft,
  Sparkles,
  Zap,
  X,
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

export default function CoreHeader({ onMenuToggle, user }: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // ✅ Nếu đang ở trong workspace cụ thể
  const isWorkspaceDetail = pathname?.match(/^\/core\/workspace\/\d+/);

  const handleGoBack = () => {
    router.push("/core");
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
      {/* Main Header Content */}
      <div className="px-4 lg:px-6 py-3 flex items-center justify-between">
        {/* ===== LEFT SECTION ===== */}
        <div className="flex items-center gap-3">
          {isWorkspaceDetail ? (
            /* Back Button for Workspace Detail */
            <button
              onClick={handleGoBack}
              className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-green-50 hover:to-emerald-50 border border-gray-200 hover:border-green-300 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors group-hover:-translate-x-1 duration-300" />
              <span className="hidden sm:inline font-semibold text-gray-700 group-hover:text-green-600 transition-colors">
                Quay lại
              </span>
            </button>
          ) : (
            <>
              {/* Mobile Menu Toggle */}
              <button
                onClick={onMenuToggle}
                className="p-2.5 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 rounded-xl transition-all duration-300 lg:hidden group"
              >
                <Menu className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors" />
              </button>

              {/* Logo & Brand */}
              <div className="flex items-center gap-3 select-none group cursor-pointer">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <LayoutDashboard className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      WorkNet
                    </span>
                    <Sparkles className="w-4 h-4 text-green-500 animate-pulse" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">Core Platform</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ===== RIGHT SECTION ===== */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Search Bar - Desktop */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm dự án, task..."
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl w-64 lg:w-72 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all duration-300 bg-gray-50/50 hover:bg-white text-sm"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs text-gray-400 bg-white border border-gray-200 rounded shadow-sm hidden lg:block">
              ⌘K
            </kbd>
          </div>

          {/* Search Button - Mobile */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-2.5 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 rounded-xl transition-all duration-300 relative group"
          >
            <Search className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors" />
          </button>

          {/* Quick Actions Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-200">
            <Zap className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs font-semibold text-green-700">Pro</span>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => alert("Tính năng đang phát triển")}
            className="p-2.5 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 rounded-xl transition-all duration-300 relative group"
          >
            <Settings className="w-5 h-5 text-gray-600 group-hover:text-gray-800 group-hover:rotate-90 transition-all duration-300" />
          </button>

          {/* Notification Button */}
          <button className="relative p-2.5 hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 rounded-xl transition-all duration-300 group">
            <Bell className="w-5 h-5 text-gray-600 group-hover:text-red-600 group-hover:animate-wiggle transition-colors" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            {/* Notification Badge */}
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
              3
            </span>
          </button>

          {/* User Avatar with Status */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setUserMenuOpen((prev) => !prev);
              }}
              className="relative w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl group"
            >
              {user?.name?.charAt(0)?.toUpperCase() || "N"}
              {/* Online Status Indicator */}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity -z-10"></div>
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
      </div>

      {/* Mobile Search Overlay */}
      {searchOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white p-4 animate-slideDown">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm dự án, task..."
              autoFocus
              className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all bg-gray-50"
            />
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .group:hover .group-hover\:animate-wiggle {
          animation: wiggle 0.5s ease-in-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </header>
  );
}