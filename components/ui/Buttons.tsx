"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

// Internal Utils
import { cn } from "@/lib/utils";

// =============================================================================
// VARIANT DEFINITIONS
// =============================================================================

/**
 * Định nghĩa các biến thể hiển thị và kích thước cho thành phần Button.
 * Sử dụng Tailwind CSS kết hợp với class-variance-authority để quản lý style.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Trạng thái chính: Màu xanh dương (Primary Action)
        default: 
          "bg-blue-600 text-white hover:bg-blue-700 shadow-sm border border-transparent",
        
        // Trạng thái nguy hiểm: Màu đỏ (Xóa hoặc hành động không thể hoàn tác)
        destructive: 
          "bg-red-600 text-white hover:bg-red-700 shadow-sm border border-transparent",
        
        // Trạng thái đường viền: Nền trắng, viền xám (Secondary Action)
        outline: 
          "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm",
        
        // Trạng thái phụ: Nền xám nhạt (Neutral Action)
        secondary: 
          "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-transparent",
        
        // Trạng thái không nền: Dùng cho nút icon hoặc các mục trong menu
        ghost: 
          "hover:bg-slate-100 hover:text-slate-900 text-slate-600",
        
        // Trạng thái liên kết: Hiển thị như một đường dẫn văn bản
        link: 
          "text-blue-600 underline-offset-4 hover:underline",
      },
      size: {
        // Kích thước chuẩn: Chiều cao 36px (h-9) phù hợp với giao diện quản trị
        default: "h-9 px-4 py-2",
        // Kích thước nhỏ: Dùng cho các khu vực chật hẹp hoặc bảng dữ liệu
        sm: "h-8 rounded-md px-3 text-xs",
        // Kích thước lớn: Dùng cho các nút kêu gọi hành động chính (CTA)
        lg: "h-10 rounded-md px-8",
        // Kích thước Icon: Nút hình vuông tỉ lệ 1:1
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Nếu được thiết lập là true, component sẽ chuyển đổi element gốc
   * thành component con thông qua Radix Slot, hỗ trợ tính đa hình (Polymorphism).
   */
  asChild?: boolean;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Thành phần Button cốt lõi của hệ thống.
 * Hỗ trợ chuyển tiếp ref (forwardRef) và tùy chỉnh linh hoạt qua variants/sizes.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // Quyết định element render (button mặc định hoặc Slot của Radix)
    const Component = asChild ? Slot : "button";

    return (
      <Component
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

// =============================================================================
// EXPORTS
// =============================================================================

export { Button, buttonVariants };