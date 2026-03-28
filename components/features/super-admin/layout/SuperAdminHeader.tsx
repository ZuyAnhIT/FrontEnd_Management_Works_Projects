"use client";

import { useState } from "react";
import { Menu, Bell, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import UserMenu from "@/components/ui/UserMenu";
import { useAuth } from "@/context/AuthContext";
import NotificationPopover from "@/components/features/admin/NotificationPopover";

// Định nghĩa Props rõ ràng cho Header (Chỉ nhận onMenuToggle)
export interface SuperAdminHeaderProps {
  onMenuToggle: () => void;
}

export default function SuperAdminHeader({ onMenuToggle }: SuperAdminHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  
  const router = useRouter();
  const { user, logout } = useAuth();

  const safeUser = {
    name: user?.fullName || "Super Admin",
    email: user?.email || "admin@worknet.com",
  };

  const toggleUserMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUserMenuOpen(!userMenuOpen);
    setNotifOpen(false);
  };

  const toggleNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifOpen(!notifOpen);
    setUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 h-14 flex items-center shadow-sm">
      <div className="w-full px-4 flex items-center justify-between">
        
        {/* Nút Toggle Menu Mobile & Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="p-2 hover:bg-slate-100 rounded-md transition-colors lg:hidden text-slate-500"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            className="flex items-center gap-2 cursor-pointer group select-none"
            onClick={() => router.push("/super-admin")}
          >
            <div className="w-8 h-8 rounded-md flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 bg-slate-900">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-slate-900 tracking-tight block leading-none max-w-[200px] truncate">
                Central System
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                Platform Admin
              </span>
            </div>
          </div>
        </div>

        {/* Menu User & Notifications */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className={`p-2 rounded-full transition-colors relative ${
                notifOpen
                  ? "bg-red-50 text-red-600"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white pointer-events-none"></span>
            </button>

            <NotificationPopover
              isOpen={notifOpen}
              onClose={() => setNotifOpen(false)}
            />
          </div>

          <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

          <div className="relative ml-1">
            <button
              onClick={toggleUserMenu}
              className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold hover:bg-red-700 transition-colors ring-2 ring-white shadow-sm focus:outline-none"
            >
              {safeUser.name.charAt(0).toUpperCase()}
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