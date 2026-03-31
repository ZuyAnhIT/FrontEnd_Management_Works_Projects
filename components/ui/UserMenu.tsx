"use client";

import React, { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User, Shield, LogOut, Moon, Sun, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

// Internal Contexts & Components
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatars";
import { cn } from "@/lib/utils";

// =============================================================================
// INTERFACES
// =============================================================================

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  onClose: () => void;
  onLogout: () => void;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Thành phần menu thả xuống của người dùng (User Dropdown Menu).
 * Cung cấp các liên kết cài đặt hồ sơ, tùy chỉnh giao diện, ngôn ngữ và đăng xuất.
 */
export default function UserMenu({ user, onClose, onLogout }: UserMenuProps) {
  // ---------------------------------------------------------------------------
  // 1. HOOKS & CONTEXT
  // ---------------------------------------------------------------------------
  const router = useRouter();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  // ---------------------------------------------------------------------------
  // 2. LOGIC HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Điều hướng người dùng và đóng menu
   */
  const handleNavigate = useCallback((path: string) => {
    onClose();
    router.push(path);
  }, [router, onClose]);

  /**
   * Chuyển đổi ngôn ngữ hệ thống
   */
  const handleToggleLanguage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextLang = language === "vn" ? "en" : "vn";
    setLanguage(nextLang);
  };

  /**
   * Chuyển đổi chế độ hiển thị Sáng/Tối
   */
  const handleToggleTheme = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTheme();
  };

  // Lắng nghe sự kiện click toàn cục để đóng menu khi người dùng nhấn ra ngoài
  useEffect(() => {
    const handleClickOutside = () => onClose();
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [onClose]);

  // ---------------------------------------------------------------------------
  // 3. RENDER
  // ---------------------------------------------------------------------------
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 origin-top-right",
        "dark:bg-slate-800 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-100"
      )}
    >
      {/* Thông tin định danh người dùng (User Header) */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-700/30">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <Avatar className="w-10 h-10 border border-white shadow-sm dark:border-slate-600">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="bg-blue-600 text-white font-bold text-sm">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full dark:border-slate-800"></div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-sm truncate dark:text-white">
              {user.name}
            </h3>
            <p className="text-xs text-slate-500 truncate dark:text-slate-400">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Danh sách các mục menu (Menu Items) */}
      <div className="p-2">
        <div className="mb-1">
          <button
            onClick={() => handleNavigate("/settings/profile")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors text-left group dark:hover:bg-slate-700"
          >
            <User className="w-4 h-4 text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-white" />
            <span className="flex-1 text-sm font-medium text-slate-700 group-hover:text-slate-900 dark:text-slate-200 dark:group-hover:text-white">
              {t("Profile", { defaultValue: "Profile" })}
            </span>
          </button>

          <button
            onClick={() => handleNavigate("/settings/account")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors text-left group dark:hover:bg-slate-700"
          >
            <Shield className="w-4 h-4 text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-white" />
            <span className="flex-1 text-sm font-medium text-slate-700 group-hover:text-slate-900 dark:text-slate-200 dark:group-hover:text-white">
              {t("Security", { defaultValue: "Security" })}
            </span>
          </button>
        </div>

        <div className="h-px bg-slate-100 my-1.5 mx-2 dark:bg-slate-700"></div>

        {/* Tùy chỉnh cá nhân (Preferences) */}
        <div className="mb-1">
          <button
            onClick={handleToggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-100 transition-colors text-left dark:hover:bg-slate-700"
          >
            <div className="flex items-center gap-3">
              {theme === "light" ? (
                <Sun className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              )}
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {t("Appearance", { defaultValue: "Appearance" })}
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase dark:bg-slate-600 dark:text-slate-300">
              {theme}
            </span>
          </button>

          <button
            onClick={handleToggleLanguage}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-100 transition-colors text-left dark:hover:bg-slate-700"
          >
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {t("Language", { defaultValue: "Language" })}
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded dark:bg-slate-600 dark:text-slate-300">
              {language === "vn" ? "Tiếng Việt" : "English"}
            </span>
          </button>
        </div>

        <div className="h-px bg-slate-100 my-1.5 mx-2 dark:bg-slate-700"></div>

        {/* Hành động Đăng xuất */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-50 transition-colors text-left group dark:hover:bg-red-900/20"
        >
          <LogOut className="w-4 h-4 text-red-500 group-hover:text-red-600 dark:text-red-400" />
          <span className="flex-1 text-sm font-medium text-red-600 group-hover:text-red-700 dark:text-red-400">
            {t("Logout", { defaultValue: "Logout" })}
          </span>
        </button>
      </div>

      {/* Thông tin phiên bản (Footer) */}
      <div className="px-5 py-2 bg-slate-50 border-t border-slate-100 text-[10px] text-center text-slate-400 dark:bg-slate-800/50 dark:border-slate-700">
        Worknet System v1.0.0
      </div>
    </div>
  );
}