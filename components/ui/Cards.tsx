"use client";

import * as React from "react";

// Internal Utils
import { cn } from "@/lib/utils";

// =============================================================================
// CARD COMPONENTS
// =============================================================================

/**
 * Thành phần gốc của Card. 
 * Thiết lập các thuộc tính về hiển thị như nền, viền, bo góc và đổ bóng nhẹ.
 */
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

/**
 * Phần đầu của Card, chứa tiêu đề và mô tả.
 * Tự động căn chỉnh các thành phần con theo chiều dọc với khoảng cách hợp lý.
 */
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

/**
 * Tiêu đề chính của Card.
 * Sử dụng thẻ h3 để đảm bảo cấu trúc ngữ nghĩa (Semantic HTML) và SEO.
 */
const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("font-semibold leading-none tracking-tight text-slate-900", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

/**
 * Phần mô tả bổ trợ cho tiêu đề, hiển thị dưới dạng văn bản nhỏ và màu sắc nhẹ nhàng hơn.
 */
const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-slate-500", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

/**
 * Vùng chứa nội dung chính của Card.
 * Loại bỏ padding-top để tạo sự gắn kết liền mạch với CardHeader.
 */
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn("p-6 pt-0", className)} 
      {...props} 
    />
  )
);
CardContent.displayName = "CardContent";

/**
 * Phần chân của Card, thường được dùng để chứa các nút hành động hoặc thông tin meta.
 */
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

/**
 * Vùng chứa các hành động phụ (như Menu, Nút đóng), thường được đặt trong CardHeader.
 * Tự động đẩy về phía bên phải của container.
 */
const CardAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("ml-auto flex items-center gap-2", className)}
      {...props}
    />
  )
);
CardAction.displayName = "CardAction";

// =============================================================================
// EXPORTS
// =============================================================================

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
};