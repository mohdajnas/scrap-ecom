import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: "new" | "used" | "pending" | "approved" | "rejected"
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, status, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
          {
            "bg-success/10 text-success": status === "new",
            "bg-warning/10 text-warning": status === "used",
            "bg-primary-light text-primary": status === "pending",
            "bg-success text-white": status === "approved",
            "bg-danger/10 text-danger": status === "rejected",
          },
          className
        )}
        {...props}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
