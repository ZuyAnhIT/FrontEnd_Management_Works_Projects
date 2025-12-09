"use client";

import { useState } from "react";
import {
  Menu, Bell, Crown, ArrowLeft,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import UserMenu from "@/components/ui/UserMenu";
import { useAuth } from "@/context/AuthContext";

// ✅ Import Component thông báo mới
import NotificationPopover from "@/components/features/admin/NotificationPopover";

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function AdminHeader({ onMenuToggle }: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false); // ✅ State cho thông báo
  
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const isCompanyAdminPage = pathname?.startsWith("/admin/company");

  const handleGoBack = () => {
    router.push("/admin");
  };

  const safeUser = {
    name: user?.fullName || "Admin User",
    email: user?.email || "admin@worknet.com",
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 h-14 flex items-center shadow-sm">
      <div className="w-full px-4 flex items-center justify-between">
        
        {/* LEFT SECTION */}
        <div className="flex items-center gap-4">
          {isCompanyAdminPage ? (
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors border border-transparent hover:border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Back to Admin</span>
            </button>
          ) : (
            <>
              <button
                onClick={onMenuToggle}
                className="p-2 hover:bg-slate-100 rounded-md transition-colors lg:hidden text-slate-500"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div 
                className="flex items-center gap-2 cursor-pointer group select-none" 
                onClick={() => router.push("/admin")}
              >
                <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
                   <Crown className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="hidden sm:block">
                   <span className="font-bold text-lg text-slate-900 tracking-tight block leading-none">
                     WorkNet
                   </span>
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                     Admin Panel
                   </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-2">
          
          {/* ✅ Notification Bell Area */}
          <div className="relative">
              <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setNotifOpen(!notifOpen);
                    setUserMenuOpen(false); // Đóng menu user nếu đang mở
                }}
                className={`p-2 rounded-full transition-colors relative ${notifOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
              >
                <Bell className="w-5 h-5" />
                {/* Dot đỏ (Logic hiển thị có thể update sau) */}
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white pointer-events-none"></span>
              </button>

              {/* ✅ Render Popover */}
              <NotificationPopover 
                  isOpen={notifOpen} 
                  onClose={() => setNotifOpen(false)} 
              />
          </div>

          <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

          {/* User Menu */}
          <div className="relative ml-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setUserMenuOpen(!userMenuOpen);
                setNotifOpen(false); // Đóng notif nếu đang mở
              }}
              className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold hover:bg-slate-900 transition-colors ring-2 ring-white shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              {safeUser.name?.charAt(0)?.toUpperCase() || "A"}
            </button>

            {userMenuOpen && (
              <UserMenu
                user={safeUser}
                onClose={() => setUserMenuOpen(false)}
                onLogout={logout}
              />
            )}
          </div>

        </div>
      </div>
    </header>
  );
}