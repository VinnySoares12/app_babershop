import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "gold" | "success" | "danger" | "muted";

const toneClasses: Record<BadgeTone, string> = {
  gold: "border-gold/30 bg-gold/10 text-gold",
  success: "border-success/30 bg-success/10 text-success",
  danger: "border-danger/30 bg-danger/10 text-danger",
  muted: "border-border bg-white/[0.03] text-muted",
};

export function Badge({
  className,
  tone = "muted",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold", toneClasses[tone], className)}
      {...props}
    />
  );
}
