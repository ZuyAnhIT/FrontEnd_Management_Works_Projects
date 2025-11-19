"use client";

import { useState } from "react";
import {
  Menu,
  Bell,
  Search,
  Settings,
  Building2,
  ArrowLeft,
  Crown, // Admin icon
  HelpCircle,
  X
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import UserMenu from "@/components/ui/UserMenu";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button"; // Giả sử có button component

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function AdminHeader({ onMenuToggle }: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { user, role, logout } = useAuth();

  const isCompanyAdminPage = pathname?.startsWith("/admin/company");

  const handleGoCompany = () => {
    router.push("/admin/company/dashboard");
  };

  const handleGoBack = () => {
    router.push("/admin");
  };

  const handleLogout = () => {
    logout();
  };

  const safeUser = {
    name: user?.fullName || "Admin User",
    email: user?.email || "admin@worknet.com",
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 h-14 flex items-center shadow-sm">
      <div className="w-full px-4 flex items-center justify-between">
        
        {/* ===== LEFT SECTION ===== */}
        <div className="flex items-center gap-4">
          {/* Back Button (Company View) */}
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
              {/* Mobile Menu Toggle */}
              <button
                onClick={onMenuToggle}
                className="p-2 hover:bg-slate-100 rounded-md transition-colors lg:hidden text-slate-500"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Logo & Brand */}
              <div className="flex items-center gap-2 cursor-pointer group" onClick={() => router.push("/admin")}>
                <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center shadow-sm">
                   <Crown className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="hidden sm:block">
                   <span className="font-bold text-lg text-slate-900 tracking-tight block leading-none">WorkNet</span>
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Admin Panel</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ===== CENTER: Search Bar (Desktop) ===== */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <div className="relative w-full group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search users, companies..."
              className="w-full pl-9 pr-4 h-9 bg-white border-2 border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded-[3px] text-sm text-slate-700 placeholder:text-slate-500 transition-all outline-none shadow-[inset_0_0_0_1px_#e2e8f0] focus:shadow-none"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden lg:inline-flex h-5 items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>

        {/* ===== RIGHT SECTION ===== */}
        <div className="flex items-center gap-1 sm:gap-2">
          
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Company Management Button (Role based) */}
          {role === "COMPANY_ADMIN" && !isCompanyAdminPage && (
             <Button 
                onClick={handleGoCompany}
                className="hidden md:flex h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 rounded-[3px] shadow-sm items-center gap-2 mr-2"
             >
                <Building2 className="w-3.5 h-3.5" />
                Company
             </Button>
          )}

          {/* Action Icons */}
          <button className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors hidden sm:flex">
             <Settings className="w-5 h-5" />
          </button>

          <button className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

          {/* User Menu */}
          <div className="relative ml-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setUserMenuOpen(!userMenuOpen);
              }}
              className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold hover:bg-slate-900 transition-colors ring-2 ring-white shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              {safeUser.name?.charAt(0)?.toUpperCase() || "A"}
            </button>

            {userMenuOpen && (
              <UserMenu
                user={safeUser}
                onClose={() => setUserMenuOpen(false)}
                onLogout={handleLogout}
              />
            )}
          </div>

        </div>
      </div>

      {/* Mobile Search Overlay */}
      {searchOpen && (
        <div className="absolute top-14 left-0 right-0 bg-white border-b border-slate-200 p-3 md:hidden animate-in slide-in-from-top-5 z-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              autoFocus
              className="w-full pl-9 pr-10 h-10 bg-slate-50 border border-slate-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}