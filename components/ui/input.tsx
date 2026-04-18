"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-10 w-full rounded-md border border-border bg-surface px-3 text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary transition-colors",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
