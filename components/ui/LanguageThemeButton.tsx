"use client";

import { useState, useCallback } from "react";
import { Globe, Moon, Sun } from "lucide-react";

// Internal Contexts & Utils
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Thành phần điều khiển ngôn ngữ và giao diện (Theme).
 * Tích hợp Dropdown để thay đổi nhanh giữa Tiếng Việt/Tiếng Anh và Sáng/Tối.
 */
export default function LanguageThemeButton() {
  // ---------------------------------------------------------------------------
  // 1. HOOKS & CONTEXT
  // ---------------------------------------------------------------------------
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // 2. HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Đổi ngôn ngữ hệ thống qua lại giữa VN và EN
   */
  const handleToggleLanguage = useCallback(() => {
    const nextLang = language === "vn" ? "en" : "vn";
    setLanguage(nextLang);
    setIsOpen(false);
  }, [language, setLanguage]);

  /**
   * Đổi chế độ hiển thị và đóng menu
   */
  const handleToggleTheme = useCallback(() => {
    toggleTheme();
    setIsOpen(false);
  }, [toggleTheme]);

  // ---------------------------------------------------------------------------
  // 3. RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className="relative">
      {/* Nút kích hoạt chính */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-2 rounded-full transition-all flex items-center gap-1.5",
          "bg-slate-100 hover:bg-slate-200 text-slate-700",
          "dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
        )}
        title="Settings"
      >
        <Globe className="w-5 h-5" />
        {theme === "light" ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>

      {/* Menu thả xuống (Dropdown) */}
      {isOpen && (
        <>
          {/* Lớp phủ để đóng menu khi click ra ngoài */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          
          <div className={cn(
            "absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 overflow-hidden",
            "dark:bg-slate-900 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-100 origin-top-right"
          )}>
            {/* Lựa chọn Ngôn ngữ */}
            <button
              className="w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onClick={handleToggleLanguage}
            >
              <span className="text-slate-700 dark:text-slate-200 font-medium">
                {language === "vn" ? "Tiếng Việt" : "English"}
              </span>
              <span className="text-lg">
                {language === "vn" ? "🇻🇳" : "🇺🇸"}
              </span>
            </button>

            <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

            {/* Lựa chọn Giao diện */}
            <button
              className="w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onClick={handleToggleTheme}
            >
              <span className="text-slate-700 dark:text-slate-200 font-medium">
                Appearance
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-bold">
                {theme}
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}