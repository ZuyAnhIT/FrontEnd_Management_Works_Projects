"use client";

import * as React from "react";

// Internal Utils
import { cn } from "@/lib/utils";

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Mở rộng thuộc tính từ React.InputHTMLAttributes để hỗ trợ đầy đủ các tính năng
 * của thẻ input chuẩn (name, autoComplete, id, onBlur, etc.)
 */
export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Thành phần nhập liệu văn bản (Input Field).
 * Tuân thủ phong cách thiết kế Jira-style với nhãn in hoa và biểu tượng đi kèm.
 */
const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ className, type = "text", label, icon, disabled, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {/* Nhãn trường dữ liệu (Jira-style Typography) */}
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* Khung chứa Input và Icon */}
        <div className="relative group">
          {/* Vùng hiển thị biểu tượng */}
          {icon && (
            <div className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 transition-colors shrink-0",
              "text-slate-400 group-focus-within:text-blue-600",
              disabled && "group-focus-within:text-slate-400"
            )}>
              {/* Clone icon để đảm bảo kích thước đồng nhất nếu cần */}
              {React.isValidElement(icon) 
                ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-4 h-4" }) 
                : icon}
            </div>
          )}

          {/* Ô nhập liệu chính */}
          <input
            type={type}
            className={cn(
              // 1. Cấu hình cơ bản (Layout & Typography)
              "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm transition-all outline-none",
              
              // 2. Màu sắc và Đường viền (Colors & Borders)
              "border-slate-200 text-slate-900 placeholder:text-slate-400",
              
              // 3. Trạng thái tương tác (Interaction States)
              "focus:ring-2 focus:ring-blue-100 focus:border-blue-600",
              "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200",
              
              // 4. Khoảng trống nếu có icon
              icon && "pl-10",
              
              className
            )}
            ref={ref}
            disabled={disabled}
            {...props}
          />
        </div>
      </div>
    );
  }
);

InputField.displayName = "InputField";

// =============================================================================
// EXPORTS
// =============================================================================

export default InputField;