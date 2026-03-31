"use client";

import React, { useMemo } from "react";
import { X, ArrowLeft, LayoutDashboard } from "lucide-react";

// Internal Utils
import { cn } from "@/lib/utils";

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

export type AuthTab = "login" | "register" | "verify" | "forgot";

interface AuthHeaderProps {
  tab: AuthTab;
  setTab: (tab: AuthTab) => void;
  onClose: () => void;
}

// =============================================================================
// HEADER CONFIGURATION
// =============================================================================

/**
 * Cấu hình tiêu đề và mô tả dựa trên trạng thái xác thực hiện tại.
 */
const HEADER_CONFIG: Record<AuthTab, { title: string; subtitle: string }> = {
  login: {
    title: "Welcome back",
    subtitle: "Log in to continue to your workspace",
  },
  register: {
    title: "Create an account",
    subtitle: "Start organizing your projects today",
  },
  verify: {
    title: "Verify your email",
    subtitle: "We've sent a secure code to your inbox",
  },
  forgot: {
    title: "Reset password",
    subtitle: "Enter your email to recover your account",
  },
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Thành phần đầu trang cho các biểu mẫu xác thực (Authentication Header).
 * Hiển thị nhận diện thương hiệu, tiêu đề động và các nút điều hướng cơ bản.
 */
export default function AuthHeader({ tab, setTab, onClose }: AuthHeaderProps) {
  
  // ---------------------------------------------------------------------------
  // 1. LOGIC HANDLERS
  // ---------------------------------------------------------------------------
  
  // Lấy nội dung hiển thị tương ứng với tab hiện tại
  const content = useMemo(() => HEADER_CONFIG[tab], [tab]);

  // Xác định xem có hiển thị nút quay lại hay không (chỉ hiện ở luồng phụ)
  const showBackButton = tab === "verify" || tab === "forgot";

  // ---------------------------------------------------------------------------
  // 2. RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className="bg-white border-b border-slate-100 px-6 py-8 relative flex flex-col items-center text-center shrink-0">
      
      {/* Nút điều hướng quay lại (Back Button) */}
      {showBackButton && (
        <button
          onClick={() => setTab("login")}
          className={cn(
            "absolute left-4 top-4 p-2 rounded-lg text-slate-400 transition-all",
            "hover:text-slate-600 hover:bg-slate-50 active:scale-95"
          )}
          type="button"
          aria-label="Back to Login"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      {/* Nút đóng quy trình (Close Button) */}
      <button
        onClick={onClose}
        className={cn(
          "absolute right-4 top-4 p-2 rounded-lg text-slate-400 transition-all",
          "hover:text-slate-600 hover:bg-slate-50 active:scale-95"
        )}
        type="button"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Biểu tượng nhận diện thương hiệu (Branding) */}
      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 mb-5 animate-in zoom-in duration-500">
        <LayoutDashboard className="w-6 h-6 text-white stroke-[2.5px]" />
      </div>

      {/* Tiêu đề và nội dung hướng dẫn */}
      <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-500">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          {content.title}
        </h2>
        <p className="text-sm text-slate-500">
          {content.subtitle}
        </p>
      </div>
    </div>
  );
}