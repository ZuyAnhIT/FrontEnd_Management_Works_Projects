import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Default: Màu đen đậm (High Contrast)
        default:
          "border-transparent bg-slate-900 text-white hover:bg-slate-900/80",
        
        // Secondary: Màu xám nhạt (Neutral)
        secondary:
          "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200",
        
        // Destructive: Màu đỏ (Bug / Critical)
        destructive:
          "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
        
        // Outline: Viền xám (Low priority)
        outline: 
          "text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-900",

        // --- Các variant mới chuẩn Jira ---
        
        // Success: Màu xanh lá (Done / Completed)
        success: 
          "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
        
        // Warning: Màu cam/vàng (In Progress / Warning)
        warning: 
          "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
          
        // Info: Màu xanh dương (Review / Processing)
        info: 
          "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean
}

function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }