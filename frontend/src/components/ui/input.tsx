import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground/70 selection:bg-primary/30 selection:text-foreground",
        "flex h-10 w-full min-w-0 rounded-lg border border-border bg-[#0a0a0d] px-3.5 py-2 text-sm shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] transition-colors",
        "outline-none hover:border-input/80 focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/25",
        "disabled:pointer-events-none disabled:opacity-50",
        "aria-invalid:border-destructive/70 aria-invalid:ring-destructive/25",
        type === "number" && "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
