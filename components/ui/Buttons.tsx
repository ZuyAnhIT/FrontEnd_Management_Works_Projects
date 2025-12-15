import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// =============================================================================
// 1. VARIANT DEFINITION (cva)
// =============================================================================

/**
 * Định nghĩa các biến thể (variants) cho component Button.
 * Sử dụng Tailwind CSS classes.
 */
const buttonVariants = cva(
    // Base styles: Focus ring màu xanh, disable mờ đi, kích thước, font, transition
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                // Primary: Xanh dương đậm (Jira Primary)
                default: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm border border-transparent",
                
                // Destructive: Đỏ (Xóa/Nguy hiểm)
                destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm border border-transparent",
                
                // Outline: Nền trắng, viền xám (Secondary actions)
                outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm",
                
                // Secondary: Nền xám nhạt (Ít dùng hơn Outline, Neutral)
                secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-transparent",
                
                // Ghost: Không nền (Icon buttons, Menu items)
                ghost: "hover:bg-slate-100 hover:text-slate-900 text-slate-600",
                
                // Link: Text xanh, gạch chân khi hover
                link: "text-blue-600 underline-offset-4 hover:underline",
            },
            size: {
                default: "h-9 px-4 py-2", // Jira thường dùng h-9 (36px) gọn hơn h-10
                sm: "h-8 rounded-md px-3 text-xs",
                lg: "h-10 rounded-md px-8",
                icon: "h-9 w-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

// =============================================================================
// 2. BUTTON COMPONENT
// =============================================================================

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

/**
 * Component Button, cho phép tùy chỉnh element gốc bằng prop 'asChild'.
 * Sử dụng React.forwardRef để chuyển tiếp ref.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        // Nếu asChild là true, sử dụng Radix Slot để render các prop lên component con
        const Comp = asChild ? Slot : "button"
        
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

// =============================================================================
// 3. EXPORTS
// =============================================================================

export { Button, buttonVariants }