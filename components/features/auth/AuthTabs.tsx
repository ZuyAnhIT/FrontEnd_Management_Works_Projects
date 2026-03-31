"use client";

// =============================================================================
// 1. IMPORT
// =============================================================================

import React from "react";

// Internal Utils & Types
import { cn } from "@/lib/utils";
import { AuthTab } from "./AuthHeader";

// =============================================================================
// 2. INTERFACES & CONSTANTS
// =============================================================================

interface AuthTabsProps {
  /**
   * Trạng thái tab hiện tại từ component cha
   */
  tab: AuthTab;
  /**
   * Hàm chuyển đổi tab
   */
  setTab: (tab: AuthTab) => void;
}

/**
 * Danh sách cấu hình các mục chuyển đổi
 */
const TAB_ITEMS: { id: AuthTab; label: string }[] = [
  { id: "login", label: "Log In" },
  { id: "register", label: "Sign Up" },
];

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

/**
 * Thành phần chuyển đổi giữa Đăng nhập và Đăng ký (Segmented Control).
 * Thiết kế theo phong cách tối giản, cung cấp phản hồi thị giác rõ ràng.
 */
export default function AuthTabs({ tab, setTab }: AuthTabsProps) {
  return (
    <div 
      className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 shadow-inner border border-slate-200/50"
      role="tablist"
    >
      {TAB_ITEMS.map((item) => {
        const isActive = tab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setTab(item.id)}
            className={cn(
              // Cấu hình cơ bản
              "flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-300 outline-none",
              
              // Trạng thái hoạt động (Active)
              isActive
                ? "bg-white text-blue-600 shadow-sm transform scale-[1.02]"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 active:scale-95"
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}