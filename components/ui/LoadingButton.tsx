"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

// Internal Utils
import { cn } from "@/lib/utils";

// =============================================================================
// VARIANT DEFINITIONS
// =============================================================================

/**
 * Cấu hình các biến thể hiển thị cho Loading Button.
 * Tương thích hoàn toàn với hệ thống Design System của dự án Worknet.
 */
const loadingButtonVariants = cva(
  "relative flex items-center justify-center gap-2 font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
  {
    variants: {
      variant: {
        // Trạng thái chính: Xanh dương (Primary)
        primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm border border-transparent focus:ring-blue-500/50",
        
        // Trạng thái phụ: Xám nhạt (Neutral)
        secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent focus:ring-slate-400/50",
        
        // Trạng thái đường viền: Nền trắng, viền xám
        outline: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm focus:ring-slate-400/50",
        
        // Trạng thái nguy hiểm: Đỏ (Danger)
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm border border-transparent focus:ring-red-500/50",
        
        // Trạng thái thành công: Xanh lá (Success)
        success: "bg-green-600 text-white hover:bg-green-700 shadow-sm border border-transparent focus:ring-green-500/50",
        
        // Trạng thái tối giản: Không nền
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100 border-transparent focus:ring-slate-400/50",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

// =============================================================================
// INTERFACES
// =============================================================================

export interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof loadingButtonVariants> {
  text: string;
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Thành phần nút hỗ trợ trạng thái đang tải (Loading).
 * Tự động vô hiệu hóa tương tác và hiển thị biểu tượng quay khi isLoading = true.
 */
const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      className,
      variant,
      size,
      text,
      loadingText = "Processing...",
      icon,
      isLoading = false,
      disabled,
      type = "submit",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={isLoading || disabled}
        className={cn(loadingButtonVariants({ variant, size, className }))}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{loadingText}</span>
          </>
        ) : (
          <>
            {icon && <span className="shrink-0">{icon}</span>}
            <span>{text}</span>
          </>
        )}
      </button>
    );
  }
);

LoadingButton.displayName = "LoadingButton";

// =============================================================================
// EXPORTS
// =============================================================================

export { LoadingButton, loadingButtonVariants };