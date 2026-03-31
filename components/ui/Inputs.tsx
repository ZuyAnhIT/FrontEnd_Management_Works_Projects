"use client";

import * as React from "react";

// Internal Utils
import { cn } from "@/lib/utils";

// =============================================================================
// INPUT COMPONENT
// =============================================================================

/**
 * Thành phần nhập liệu (Input) cơ bản của hệ thống.
 * Hỗ trợ đầy đủ các thuộc tính của thẻ input HTML và tích hợp sẵn các trạng thái 
 * hiển thị (Focus, Disabled, Error) theo chuẩn Tailwind CSS.
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          // 1. Cấu hình cơ bản (Layout & Typography)
          "h-9 w-full min-w-0 rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-all outline-none",
          "placeholder:text-slate-400 text-slate-900",
          "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-900",
          
          // 2. Trạng thái tương tác (Interaction States)
          "focus-visible:border-blue-600 focus-visible:ring-[3px] focus-visible:ring-blue-600/20",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          
          // 3. Trạng thái lỗi (Accessibility & Validation)
          "aria-invalid:border-red-500 aria-invalid:ring-red-500/20",
          
          // 4. Chế độ tối (Dark mode - Nếu có)
          "dark:bg-slate-900/30 dark:border-slate-800 dark:text-slate-100",
          
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

// =============================================================================
// EXPORTS
// =============================================================================

export { Input };