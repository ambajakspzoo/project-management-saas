import { ProjectStatus } from "@prisma/client";

export const projectStatusLabels: Record<ProjectStatus, string> = {
  ACTIVE: "Active",
  ON_HOLD: "On hold",
  COMPLETED: "Completed",
};

export const projectStatusBadgeClasses: Record<ProjectStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ON_HOLD: "bg-amber-50 text-amber-800 border-amber-200",
  COMPLETED: "bg-zinc-100 text-zinc-600 border-zinc-200",
};
