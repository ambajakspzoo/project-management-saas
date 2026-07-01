import { ReactNode } from "react";

import { Button } from "@/components/ui/Button";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: ReactNode;
};

export function EmptyState({
  title,
  description,
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-6 py-12 text-center">
      {icon ? (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
          {icon}
        </div>
      ) : null}
      <p className="text-sm font-medium text-zinc-900">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">
        {description}
      </p>
      {action ? (
        <Button className="mt-4" variant="outline" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
