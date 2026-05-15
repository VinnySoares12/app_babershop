import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-app border border-border bg-surface/88 p-5 shadow-premium backdrop-blur", className)}
      {...props}
    />
  );
}
