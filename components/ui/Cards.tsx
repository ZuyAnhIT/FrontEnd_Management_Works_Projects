import * as React from 'react'
import { cn } from '@/lib/utils'

// =============================================================================
// 1. CARD ROOT
// =============================================================================

/**
 * Component gốc của Card. 
 * Định nghĩa style cơ bản: nền trắng, bo góc, viền và đổ bóng nhẹ.
 */
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                // Base styles: rounded-xl, border, bg-white, text-slate-900, shadow-sm
                "rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm",
                className
            )}
            {...props}
        />
    )
)
Card.displayName = "Card"

// =============================================================================
// 2. CARD HEADER
// =============================================================================

/**
 * Container cho phần tiêu đề và mô tả.
 * Sử dụng flex-col để xếp Title và Description dọc.
 */
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            // Base styles: flex-col, space-y-1.5, padding 6
            className={cn("flex flex-col space-y-1.5 p-6", className)}
            {...props}
        />
    )
)
CardHeader.displayName = "CardHeader"

// =============================================================================
// 3. CARD TITLE
// =============================================================================

/**
 * Tiêu đề chính của Card.
 * Định dạng: font đậm, màu đen.
 */
const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        // Sử dụng h3 tag cho tiêu đề
        <h3
            ref={ref}
            // Base styles: font-semibold, leading-none, tracking-tight, text-slate-900
            className={cn("font-semibold leading-none tracking-tight text-slate-900", className)}
            {...props}
        />
    )
)
CardTitle.displayName = "CardTitle"

// =============================================================================
// 4. CARD DESCRIPTION
// =============================================================================

/**
 * Mô tả phụ cho Card, thường nằm dưới Title.
 * Định dạng: text nhỏ, màu xám nhạt.
 */
const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p
            ref={ref}
            // Base styles: text-sm, text-slate-500
            className={cn("text-sm text-slate-500", className)}
            {...props}
        />
    )
)
CardDescription.displayName = "CardDescription"

// =============================================================================
// 5. CARD CONTENT
// =============================================================================

/**
 * Container cho nội dung chính của Card.
 * Padding: p-6, pt-0 (loại bỏ padding trên cùng vì thường được handle bởi CardHeader).
 */
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
    )
)
CardContent.displayName = "CardContent"

// =============================================================================
// 6. CARD FOOTER
// =============================================================================

/**
 * Container cho phần chân Card (Footer).
 * Thường dùng để chứa các hành động hoặc meta-data.
 */
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            // Base styles: flex items-center, p-6, pt-0
            className={cn("flex items-center p-6 pt-0", className)}
            {...props}
        />
    )
)
CardFooter.displayName = "CardFooter"

// =============================================================================
// 7. CARD ACTION (Tùy chỉnh)
// =============================================================================

/**
 * Container cho các Action buttons, thường được đặt ở góc phải Header.
 * Sử dụng ml-auto để đẩy sang phải.
 */
const CardAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            // Base styles: ml-auto, flex items-center, gap-2
            className={cn("ml-auto flex items-center gap-2", className)}
            {...props}
        />
    )
)
CardAction.displayName = "CardAction"

// =============================================================================
// 8. EXPORTS
// =============================================================================

export {
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardDescription,
    CardContent,
    CardAction,
}