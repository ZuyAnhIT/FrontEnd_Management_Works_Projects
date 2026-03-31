"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

// Internal Utils
import { cn } from "@/lib/utils";

// =============================================================================
// AVATAR COMPONENTS
// =============================================================================

/**
 * Thành phần khung chứa (Root) của ảnh đại diện.
 * Thiết lập các thuộc tính cơ bản về kích thước, bo góc và chống tràn.
 */
function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  );
}

/**
 * Thành phần hiển thị hình ảnh thực tế của người dùng.
 * Đảm bảo hình ảnh lấp đầy khung chứa và giữ đúng tỉ lệ khung hình.
 */
function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

/**
 * Thành phần hiển thị khi hình ảnh không tải được hoặc không có sẵn.
 * Thường dùng để hiển thị chữ cái đầu tên người dùng hoặc icon mặc định.
 */
function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export { Avatar, AvatarImage, AvatarFallback };