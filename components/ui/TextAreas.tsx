"use client";

import * as React from "react";

// Internal Utils
import { cn } from "@/lib/utils";

// =============================================================================
// TEXTAREA COMPONENT
// =============================================================================

/**
 * Thành phần nhập liệu văn bản nhiều dòng (Textarea).
 * Hỗ trợ tự động điều chỉnh kích thước theo khung chứa, các trạng thái tương tác
 * (Focus, Disabled) và tuân thủ phong cách thiết kế Jira-style.
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          // 1. Cấu hình cơ bản (Layout & Typography)
          "flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm transition-all outline-none",
          
          // 2. Màu sắc và Đường viền (Colors & Borders)
          "border-slate-300 text-slate-900 placeholder:text-slate-400",
          
          // 3. Trạng thái tương tác (Interaction States)
          "focus:ring-2 focus:ring-blue-100 focus:border-blue-600",
          "disabled:cursor-not-allowed disabled:opacity-50",
          
          // 4. Chế độ tối (Dark Mode - Dự phòng)
          "dark:bg-slate-950 dark:border-slate-800 dark:text-slate-50 dark:placeholder:text-slate-500",
          
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

// =============================================================================
// EXPORTS
// =============================================================================

export { Textarea };