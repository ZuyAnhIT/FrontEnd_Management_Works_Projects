"use client";
import { useRouter } from "next/navigation";
import { User, Shield, LogOut, Moon, Sun, Globe, Check } from "lucide-react";
import { useEffect, useState } from "react";

interface UserMenuProps {
  user: {
    name: string;
    email: string;
  };
  onClose: () => void;
  onLogout: () => void;
}

export default function UserMenu({ user, onClose, onLogout }: UserMenuProps) {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [language, setLanguage] = useState<"vn" | "en">("vn");

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path);
  };

  // Đóng menu khi click ngoài
  useEffect(() => {
    const handleClickOutside = () => onClose();
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [onClose]);

  const toggleTheme = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const toggleLanguage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLanguage(prev => prev === "vn" ? "en" : "vn");
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right"
    >
      {/* 1. User Profile Header (Minimalist) */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            {/* Online status dot */}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-sm truncate">{user?.name}</h3>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* 2. Menu Items */}
      <div className="p-2">
        
        {/* Section: Account */}
        <div className="mb-2">
            <button
            onClick={() => handleNavigate("/settings/profile")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors text-left group"
            >
            <User className="w-4 h-4 text-slate-500 group-hover:text-slate-800" />
            <span className="flex-1 text-sm font-medium text-slate-700 group-hover:text-slate-900">Profile</span>
            </button>

            <button
            onClick={() => handleNavigate("/settings/account")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors text-left group"
            >
            <Shield className="w-4 h-4 text-slate-500 group-hover:text-slate-800" />
            <span className="flex-1 text-sm font-medium text-slate-700 group-hover:text-slate-900">Security</span>
            </button>
        </div>

        <div className="h-px bg-slate-100 my-1 mx-2"></div>

        {/* Section: Preferences */}
        <div className="mb-2">
            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-100 transition-colors text-left group"
            >
                <div className="flex items-center gap-3">
                    {theme === "light" ? <Sun className="w-4 h-4 text-slate-500" /> : <Moon className="w-4 h-4 text-slate-500" />}
                    <span className="text-sm font-medium text-slate-700">Theme</span>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded capitalize">
                    {theme}
                </span>
            </button>

            {/* Language Toggle */}
            <button
                onClick={toggleLanguage}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-100 transition-colors text-left group"
            >
                <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">Language</span>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                    {language === 'vn' ? 'Tiếng Việt' : 'English'}
                </span>
            </button>
        </div>

        <div className="h-px bg-slate-100 my-1 mx-2"></div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-50 transition-colors text-left group mt-1"
        >
          <LogOut className="w-4 h-4 text-red-500 group-hover:text-red-600" />
          <span className="flex-1 text-sm font-medium text-red-600 group-hover:text-red-700">Log out</span>
        </button>

      </div>
      
      {/* Footer Info (Optional) */}
      <div className="px-5 py-2 bg-slate-50 border-t border-slate-100 text-[10px] text-center text-slate-400">
         ProjectHub v1.0.0
      </div>
    </div>
  );
}