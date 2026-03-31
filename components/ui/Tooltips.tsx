"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

// Internal Utils
import { cn } from "@/lib/utils";

// =============================================================================
// TOOLTIP COMPONENTS
// =============================================================================

/**
 * Thành phần cung cấp ngữ cảnh (Provider) cho toàn bộ hệ thống Tooltip.
 * Thường được bao bọc ở cấp cao nhất của ứng dụng hoặc một vùng giao diện lớn.
 */
const TooltipProvider = TooltipPrimitive.Provider;

/**
 * Thành phần gốc quản lý trạng thái hiển thị của một Tooltip cụ thể.
 */
const Tooltip = TooltipPrimitive.Root;

/**
 * Thành phần kích hoạt Tooltip (thường là Nút hoặc Icon).
 */
const TooltipTrigger = TooltipPrimitive.Trigger;

/**
 * Nội dung hiển thị của Tooltip.
 * Hỗ trợ các hiệu ứng animation và tự động tính toán vị trí hiển thị tối ưu.
 */
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      // 1. Cấu hình cơ bản (Layout & Typography)
      "z-50 overflow-hidden rounded-md border border-slate-200 bg-slate-900 px-3 py-1.5 text-xs text-slate-50 shadow-md",
      
      // 2. Hiệu ứng hiển thị (Animations)
      "animate-in fade-in-0 zoom-in-95 duration-200",
      
      // 3. Hiệu ứng khi đóng (Exit Animations)
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      
      // 4. Hướng xuất hiện dựa trên vị trí (Side-based slide in)
      "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      
      className
    )}
    {...props}
  />
));

TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// =============================================================================
// EXPORTS
// =============================================================================

export { 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent, 
  TooltipProvider 
};