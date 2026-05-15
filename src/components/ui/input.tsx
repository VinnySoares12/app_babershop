import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-xl border border-border bg-background/70 px-4 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-gold/60 focus:ring-2 focus:ring-gold/10",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
