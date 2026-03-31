"use client";

// =============================================================================
// 1. IMPORTS
// =============================================================================

import React from "react";
import { useTranslation } from "react-i18next";

// Context & Utils
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

// =============================================================================
// 2. MAIN COMPONENT
// =============================================================================

/**
 * Thành phần chân trang (Footer) cho trang Landing Page.
 * Hiển thị thông tin bản quyền và tự động cập nhật năm hiện tại.
 */
export default function LandingFooter() {
  
  // ---------------------------------------------------------------------------
  // 3. HOOKS & VARIABLES
  // ---------------------------------------------------------------------------
  
  const { t } = useTranslation();
  
  // Khai báo theme để đảm bảo component đồng bộ re-render khi đổi chế độ Sáng/Tối
  const { theme } = useTheme(); 
  
  const currentYear = new Date().getFullYear();

  // ---------------------------------------------------------------------------
  // 4. RENDER LOGIC
  // ---------------------------------------------------------------------------

  return (
    <footer
      className={cn(
        "py-10 text-center transition-colors duration-300",
        "bg-white dark:bg-slate-900",
        "border-t border-slate-200 dark:border-slate-800"
      )}
    >
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-[13px] font-semibold tracking-wide text-[#6B778C] dark:text-slate-400">
          {t("footer.copyright", { year: currentYear })}
        </p>
      </div>
    </footer>
  );
}