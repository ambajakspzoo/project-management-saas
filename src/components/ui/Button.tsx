import { ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-zinc-900 text-white hover:bg-zinc-800 focus-visible:ring-zinc-900",
  secondary:
    "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 focus-visible:ring-zinc-400",
  outline:
    "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 focus-visible:ring-zinc-400",
  ghost: "text-zinc-700 hover:bg-zinc-100 focus-visible:ring-zinc-400",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
} as const;

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      type = "button",
      disabled,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
