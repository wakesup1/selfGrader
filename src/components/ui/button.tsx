import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
};

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "default" && "bg-cyan-400 text-zinc-950 hover:bg-cyan-300",
        variant === "outline" && "border border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800",
        variant === "ghost" && "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100",
        className,
      )}
      {...props}
    />
  );
}
