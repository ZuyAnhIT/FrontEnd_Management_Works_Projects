"use client";

import { X, ArrowLeft, LayoutDashboard } from "lucide-react";

// =============================================================================
// 1. INTERFACES & TYPES
// =============================================================================

// Định nghĩa các loại Tab có thể có
export type AuthTab = "login" | "register" | "verify" | "forgot";

interface AuthHeaderProps {
  tab: AuthTab; // Sử dụng type cụ thể thay vì string
  setTab: (tab: AuthTab) => void;
  onClose: () => void;
}

// =============================================================================
// 2. CONFIGURATION (Cấu hình nội dung)
// =============================================================================

const HEADER_CONTENT: Record<AuthTab, { title: string; subtitle: string }> = {
  login: {
    title: "Welcome back",
    subtitle: "Log in to continue to WorkNet",
  },
  register: {
    title: "Create an account",
    subtitle: "Sign up to get started",
  },
  verify: {
    title: "Verify your email",
    subtitle: "Enter the code sent to your email",
  },
  forgot: {
    title: "Reset password",
    subtitle: "Enter your email to reset password",
  },
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================

export default function AuthHeader({ tab, setTab, onClose }: AuthHeaderProps) {
  // Lấy nội dung text tương ứng với tab hiện tại
  const content = HEADER_CONTENT[tab] || {
    title: "Welcome",
    subtitle: "Please authenticate",
  };

  return (
    <div className="bg-white border-b border-slate-100 px-6 py-8 relative flex flex-col items-center text-center">
      
      {/* --- Nút Quay lại (Chỉ hiện khi ở trang Verify hoặc Forgot) --- */}
      {(tab === "verify" || tab === "forgot") && (
        <button
          onClick={() => setTab("login")}
          className="absolute left-4 top-4 p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          type="button"
          title="Back to Login"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      {/* --- Nút Đóng Modal --- */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        type="button"
        title="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* --- Logo Branding --- */}
      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm mb-4">
        <LayoutDashboard className="w-6 h-6 text-white" />
      </div>

      {/* --- Tiêu đề & Mô tả --- */}
      <h2 className="text-xl font-bold text-slate-900 tracking-tight">
        {content.title}
      </h2>
      <p className="text-sm text-slate-500 mt-1">
        {content.subtitle}
      </p>
    </div>
  );
}