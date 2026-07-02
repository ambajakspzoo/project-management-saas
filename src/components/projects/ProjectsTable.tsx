import { formatBudget, formatDeadline } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Project,
  ProjectListSortField,
  ProjectListSortOrder,
} from "@/types/project";

import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";

type ProjectsTableProps = {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  deletingProjectId?: string | null;
  isRefetching?: boolean;
  disabled?: boolean;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  sort?: ProjectListSortField;
  order?: ProjectListSortOrder;
  onSortChange?: (field: ProjectListSortField) => void;
};

const sortableColumns: {
  field: ProjectListSortField;
  label: string;
}[] = [
  { field: "title", label: "Title" },
  { field: "status", label: "Status" },
  { field: "deadline", label: "Deadline" },
  { field: "assignee", label: "Assignee" },
  { field: "budget", label: "Budget" },
];

function SortableColumnHeader({
  label,
  field,
  sort,
  order,
  onSortChange,
  disabled,
}: {
  label: string;
  field: ProjectListSortField;
  sort?: ProjectListSortField;
  order?: ProjectListSortOrder;
  onSortChange?: (field: ProjectListSortField) => void;
  disabled: boolean;
}) {
  const isActive = sort === field;
  const ariaSort = isActive
    ? order === "asc"
      ? "ascending"
      : "descending"
    : "none";

  if (!onSortChange) {
    return (
      <th className="px-4 py-3 text-left font-medium text-zinc-600">{label}</th>
    );
  }

  return (
    <th
      aria-sort={ariaSort}
      className="px-4 py-3 text-left font-medium text-zinc-600"
    >
      <button
        type="button"
        onClick={() => onSortChange(field)}
        disabled={disabled}
        className={cn(
          "inline-flex items-center gap-1 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/10 disabled:cursor-not-allowed disabled:opacity-50",
          isActive ? "text-zinc-900" : "text-zinc-600 hover:text-zinc-900",
        )}
      >
        <span>{label}</span>
        {isActive ? (
          <span aria-hidden="true" className="text-xs text-zinc-500">
            {order === "asc" ? "↑" : "↓"}
          </span>
        ) : null}
      </button>
    </th>
  );
}

export function ProjectsTable({
  projects,
  onEdit,
  onDelete,
  deletingProjectId = null,
  isRefetching = false,
  disabled = false,
  page,
  pageSize,
  totalCount,
  onPageChange,
  sort,
  order,
  onSortChange,
}: ProjectsTableProps) {
  const isRowDisabled = disabled || isRefetching;
  const isHeaderDisabled = disabled || isRefetching;

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white">
      {isRefetching ? (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]"
          aria-live="polite"
          aria-busy="true"
        >
          <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-600 shadow-sm">
            Updating projects...
          </span>
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50">
            <tr>
              {sortableColumns.map((column) => (
                <SortableColumnHeader
                  key={column.field}
                  label={column.label}
                  field={column.field}
                  sort={sort}
                  order={order}
                  onSortChange={onSortChange}
                  disabled={isHeaderDisabled}
                />
              ))}
              <th className="px-4 py-3 text-right font-medium text-zinc-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-zinc-50/80">
                <td className="px-4 py-3">
                  <div className="font-medium text-zinc-900">
                    {project.title}
                  </div>
                  {project.description ? (
                    <div className="mt-0.5 line-clamp-1 text-zinc-500">
                      {project.description}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={project.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-zinc-700">
                  {formatDeadline(project.deadline)}
                </td>
                <td className="px-4 py-3 text-zinc-700">
                  {project.teamMember.name}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-zinc-700">
                  {formatBudget(project.budget)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(project)}
                      disabled={
                        isRowDisabled || deletingProjectId === project.id
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => onDelete(project)}
                      disabled={
                        isRowDisabled || deletingProjectId === project.id
                      }
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {page && pageSize && totalCount !== undefined && onPageChange ? (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={onPageChange}
          disabled={disabled || isRefetching}
          itemLabel="projects"
        />
      ) : null}
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 6 }).map((_, index) => (
        <td key={index} className="px-4 py-3">
          <div className="h-4 animate-pulse rounded bg-zinc-200" />
        </td>
      ))}
    </tr>
  );
}

export function ProjectsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50">
            <tr>
              {[
                "Title",
                "Status",
                "Deadline",
                "Assignee",
                "Budget",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className="px-4 py-3 text-left font-medium text-zinc-600"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonRow key={index} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
