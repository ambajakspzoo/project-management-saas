"use client";

import { FormEvent } from "react";

import { projectStatusLabels } from "@/lib/project-status";
import { ProjectFormValues } from "@/lib/validations/project-form";
import { cn } from "@/lib/utils";
import { TeamMemberSummary } from "@/types/project";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

type ProjectFormProps = {
  values: ProjectFormValues;
  teamMembers: TeamMemberSummary[];
  errors: Partial<Record<keyof ProjectFormValues, string>>;
  apiError: string | null;
  isSubmitting: boolean;
  submitLabel: string;
  onChange: (values: ProjectFormValues) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export function ProjectForm({
  values,
  teamMembers,
  errors,
  apiError,
  isSubmitting,
  submitLabel,
  onChange,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  const updateField = <K extends keyof ProjectFormValues>(
    field: K,
    value: ProjectFormValues[K],
  ) => {
    onChange({ ...values, [field]: value });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {apiError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {apiError}
        </div>
      ) : null}

      <Input
        label="Title"
        value={values.title}
        onChange={(event) => updateField("title", event.target.value)}
        error={errors.title}
        disabled={isSubmitting}
        required
      />

      <div className="space-y-1.5">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-zinc-700"
        >
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          value={values.description}
          onChange={(event) => updateField("description", event.target.value)}
          disabled={isSubmitting}
          className={cn(
            "flex w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 disabled:cursor-not-allowed disabled:bg-zinc-50",
            errors.description &&
              "border-red-500 focus:border-red-500 focus:ring-red-500/10",
          )}
          placeholder="Optional project description"
        />
        {errors.description ? (
          <p className="text-xs text-red-600">{errors.description}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Status"
          value={values.status}
          onChange={(event) =>
            updateField(
              "status",
              event.target.value as ProjectFormValues["status"],
            )
          }
          error={errors.status}
          disabled={isSubmitting}
        >
          {Object.entries(projectStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>

        <Input
          label="Deadline"
          type="date"
          value={values.deadline}
          onChange={(event) => updateField("deadline", event.target.value)}
          error={errors.deadline}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Team member"
          value={values.teamMemberId}
          onChange={(event) => updateField("teamMemberId", event.target.value)}
          error={errors.teamMemberId}
          disabled={isSubmitting || teamMembers.length === 0}
          required
        >
          <option value="" disabled>
            Select a team member
          </option>
          {teamMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </Select>

        <Input
          label="Budget"
          type="number"
          min="0"
          step="0.01"
          value={values.budget}
          onChange={(event) => updateField("budget", event.target.value)}
          error={errors.budget}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
