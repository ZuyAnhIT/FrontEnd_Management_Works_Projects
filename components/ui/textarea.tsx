import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          // Base styles
          "flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm transition-all",
          
          // Colors & Borders (Jira Style)
          "border-slate-300 text-slate-900 placeholder:text-slate-400",
          
          // Focus State (Blue Highlight)
          "focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600",
          
          // Disabled State
          "disabled:cursor-not-allowed disabled:opacity-50",
          
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }