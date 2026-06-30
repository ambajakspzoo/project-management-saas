import { SelectHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, label, error, id, children, ...props },
  ref,
) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label ? (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-zinc-700"
        >
          {label}
        </label>
      ) : null}
      <select
        ref={ref}
        id={selectId}
        className={cn(
          "flex h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 disabled:cursor-not-allowed disabled:bg-zinc-50",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
});
