"use client";

import { useState } from "react"; // Chỉ dùng để quản lý đóng/mở dropdown
import { Globe, Moon, Sun } from "lucide-react";
import i18n from "@/i18n";
// 1. Import hook từ Context bạn đã tạo
import { useTheme } from "@/context/ThemeContext"; 

export default function LanguageThemeButton() {
  // 2. Lấy state và hàm toggle từ Context toàn cục
  const { theme, toggleTheme } = useTheme(); 
  
  const [open, setOpen] = useState(false);

  // 3. XÓA BỎ useEffect load theme (ThemeContext đã làm việc này rồi)
  
  // 4. XÓA BỎ hàm toggleTheme thủ công (ThemeContext đã có hàm này)

  const toggleLanguage = () => {
    const newLang = i18n.language === "vn" ? "en" : "vn";
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
  };

  return (
    <div className="relative">
      {/* Main Button */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition flex items-center gap-1"
      >
        <Globe className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        
        {/* Dùng biến theme từ Context */}
        {theme === "light" ? (
          <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        ) : (
          <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-50 py-2">
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-800 dark:text-gray-200"
            onClick={() => {
              toggleLanguage();
              setOpen(false);
            }}
          >
            {i18n.language === "vn" ? "🇻🇳 Tiếng Việt" : "🇺🇸 English"}
          </button>

          <div className="border-t border-gray-200 dark:border-slate-700 my-1"></div>

          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-800 dark:text-gray-200 flex items-center gap-2"
            onClick={() => {
              // 5. Gọi hàm toggle từ Context
              toggleTheme(); 
              setOpen(false);
            }}
          >
            {/* Logic hiển thị text */}
            {theme === "light" ? "Dark" : "Light"}
          </button>
        </div>
      )}
    </div>
  );
}