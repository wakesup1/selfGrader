import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
};

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variant === "default" && "bg-amber-700 text-white hover:bg-amber-800 active:bg-amber-900",
        variant === "outline" && "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 active:bg-stone-100",
        variant === "ghost"   && "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
        className,
      )}
      {...props}
    />
  );
}
