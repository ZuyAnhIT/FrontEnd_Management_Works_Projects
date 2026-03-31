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
 * Cấu hình các biến thể hiển thị cho thành phần Badge sử dụng Tailwind CSS.
 * Bao gồm các trạng thái mặc định và các trạng thái nghiệp vụ (Status style).
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Trạng thái mặc định: Độ tương phản cao
        default:
          "border-transparent bg-slate-900 text-white hover:bg-slate-900/80",
        
        // Trạng thái phụ: Màu trung tính
        secondary:
          "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200",
        
        // Trạng thái nguy hiểm: Dùng cho lỗi nghiêm trọng hoặc Bug
        destructive:
          "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
        
        // Trạng thái đường viền: Ưu tiên thấp
        outline:
          "text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-900",
        
        // Trạng thái thành công: Dùng cho công việc đã hoàn thành
        success:
          "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
        
        // Trạng thái cảnh báo: Dùng cho công việc đang xử lý hoặc cần lưu ý
        warning:
          "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
        
        // Trạng thái thông tin: Dùng cho việc xem xét hoặc xử lý tài liệu
        info:
          "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Nếu được thiết lập là true, component sẽ chuyển đổi element gốc 
   * thành component con thông qua Radix Slot.
   */
  asChild?: boolean;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Thành phần Badge dùng để hiển thị nhãn trạng thái hoặc thẻ phân loại.
 */
function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  // Quyết định element render dựa trên thuộc tính asChild
  const Component = asChild ? Slot : "div";
  
  return (
    <Component 
      className={cn(badgeVariants({ variant }), className)} 
      {...props} 
    />
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export { Badge, badgeVariants };