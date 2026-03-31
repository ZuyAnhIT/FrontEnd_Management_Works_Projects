"use client";

import * as React from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

// Internal Utils
import { cn } from "@/lib/utils";

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Mở rộng từ React.InputHTMLAttributes để hỗ trợ đầy đủ các tính năng 
 * như autoComplete, name, id, onFocus, v.v.
 */
export interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  show: boolean;    // Quản lý trạng thái ẩn/hiện mật khẩu từ bên ngoài
  toggle: () => void; // Hàm chuyển đổi trạng thái show
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Thành phần nhập liệu mật khẩu chuyên dụng.
 * Tích hợp sẵn biểu tượng ổ khóa, nút chuyển đổi ẩn/hiện và tuân thủ Jira-style.
 */
const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ className, label, show, toggle, disabled, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {/* Nhãn trường dữ liệu (Jira-style Typography) */}
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* Khung chứa Input và các Icons */}
        <div className="relative group">
          {/* Biểu tượng ổ khóa cố định bên trái */}
          <div className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 transition-colors shrink-0",
            "text-slate-400 group-focus-within:text-blue-600",
            disabled && "group-focus-within:text-slate-400"
          )}>
            <Lock className="w-4 h-4" />
          </div>

          {/* Ô nhập liệu mật khẩu */}
          <input
            ref={ref}
            type={show ? "text" : "password"}
            disabled={disabled}
            className={cn(
              // 1. Cấu hình cơ bản (Layout & Typography)
              "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm transition-all outline-none",
              
              // 2. Màu sắc và Đường viền (Colors & Borders)
              "border-slate-200 text-slate-900 placeholder:text-slate-300",
              
              // 3. Trạng thái tương tác (Interaction States)
              "focus:ring-2 focus:ring-blue-100 focus:border-blue-600",
              "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
              
              // 4. Khoảng trống cho icons (Trái: Lock, Phải: Eye)
              "pl-10 pr-10",
              
              className
            )}
            {...props}
          />

          {/* Nút Toggle Ẩn/Hiện mật khẩu */}
          <button
            type="button" // Quan trọng: Tránh submit form nhầm
            onClick={toggle}
            disabled={disabled}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all",
              "text-slate-400 hover:text-slate-600 hover:bg-slate-100",
              "disabled:cursor-not-allowed disabled:hover:bg-transparent"
            )}
            title={show ? "Hide password" : "Show password"}
          >
            {show ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    );
  }
);

PasswordField.displayName = "PasswordField";

// =============================================================================
// EXPORTS
// =============================================================================

export default PasswordField;