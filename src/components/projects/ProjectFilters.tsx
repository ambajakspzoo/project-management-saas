import { projectStatusLabels } from "@/lib/project-status";
import { ProjectStatusFilter } from "@/types/project";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

type ProjectFiltersProps = {
  search: string;
  status: ProjectStatusFilter;
  disabled?: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: ProjectStatusFilter) => void;
};

const statusOptions: { value: ProjectStatusFilter; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "ACTIVE", label: projectStatusLabels.ACTIVE },
  { value: "ON_HOLD", label: projectStatusLabels.ON_HOLD },
  { value: "COMPLETED", label: projectStatusLabels.COMPLETED },
];

export function ProjectFilters({
  search,
  status,
  disabled = false,
  onSearchChange,
  onStatusChange,
}: ProjectFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-2xl">
      <Input
        label="Search"
        placeholder="Search by title or description..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        disabled={disabled}
      />
      <Select
        label="Status"
        value={status}
        onChange={(event) =>
          onStatusChange(event.target.value as ProjectStatusFilter)
        }
        disabled={disabled}
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
