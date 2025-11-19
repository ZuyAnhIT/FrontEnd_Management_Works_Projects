"use client";

import { useState } from "react";
import {
  Menu,
  Bell,
  LayoutDashboard,
  Search,
  Settings,
  ArrowLeft,
  HelpCircle,
  Zap,
  X,
  ChevronDown
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

export default function MemberHeader({ onMenuToggle, user }: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isWorkspaceDetail = pathname?.match(/^\/member\/workspace\/\d+/);

  const handleGoBack = () => {
    router.push("/member");
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/");
  };

  return (
    // Header Container: White background, thin border
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 h-14 flex items-center shadow-sm">
      <div className="w-full px-4 flex items-center justify-between">
        
        {/* ===== LEFT SECTION ===== */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onMenuToggle}
            className="p-2 hover:bg-slate-100 rounded-md transition-colors lg:hidden text-slate-500"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Back Button (Workspace Detail) */}
          {isWorkspaceDetail ? (
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors border border-transparent hover:border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Back</span>
            </button>
          ) : (
            /* Logo & Brand */
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => router.push("/member")}>
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center shadow-sm">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="hidden sm:block font-bold text-lg text-slate-800 tracking-tight">
                WorkNet
              </span>
            </div>
          )}
        </div>

        {/* ===== CENTER: Search Bar (Desktop) ===== */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <div className="relative w-full group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search projects, tasks..."
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

          {/* Upgrade Badge */}
          <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-[10px] font-bold text-amber-700 cursor-pointer hover:bg-amber-100 transition-colors mr-2">
            <Zap className="w-3 h-3" />
            <span>PRO</span>
          </div>

          {/* Action Icons */}
          <button className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors hidden sm:flex">
             <Settings className="w-5 h-5" />
          </button>

          <button className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          <button className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors hidden sm:flex">
             <HelpCircle className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

          {/* User Menu */}
          <div className="relative ml-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setUserMenuOpen(!userMenuOpen);
              }}
              className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold hover:bg-slate-800 transition-colors ring-2 ring-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
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
        <div className="absolute top-14 left-0 right-0 bg-white border-b border-slate-200 p-3 md:hidden animate-in slide-in-from-top-5">
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