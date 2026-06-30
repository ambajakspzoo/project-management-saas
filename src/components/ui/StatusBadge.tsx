import { ProjectStatus } from "@prisma/client";

import {
  projectStatusBadgeClasses,
  projectStatusLabels,
} from "@/lib/project-status";
import { cn } from "@/lib/utils";

import { Badge } from "./Badge";

type StatusBadgeProps = {
  status: ProjectStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge className={cn(projectStatusBadgeClasses[status], className)}>
      {projectStatusLabels[status]}
    </Badge>
  );
}
