"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full resize-none bg-transparent text-foreground placeholder:text-foreground-muted placeholder:italic focus:outline-none",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
