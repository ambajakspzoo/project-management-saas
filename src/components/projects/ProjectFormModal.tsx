"use client";

import { useEffect, useState } from "react";

import {
  emptyProjectFormValues,
  formValuesToCreatePayload,
  formValuesToUpdatePayload,
  mapApiValidationErrors,
  mapZodErrors,
  projectFormSchema,
  projectToFormValues,
  ProjectFormValues,
} from "@/lib/validations/project-form";
import { Project, TeamMemberSummary } from "@/types/project";

import { Modal } from "@/components/ui/Modal";

import { ProjectForm } from "./ProjectForm";

type ProjectFormModalProps = {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onSaved: () => void;
};

export function ProjectFormModal({
  isOpen,
  project,
  onClose,
  onSaved,
}: ProjectFormModalProps) {
  const isEditing = project !== null;
  const [values, setValues] = useState<ProjectFormValues>(() =>
    project ? projectToFormValues(project) : emptyProjectFormValues,
  );
  const [teamMembers, setTeamMembers] = useState<TeamMemberSummary[]>([]);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ProjectFormValues, string>>
  >({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTeamMembers, setIsLoadingTeamMembers] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    async function loadTeamMembers() {
      setIsLoadingTeamMembers(true);

      try {
        const response = await fetch("/api/team-members");

        if (!response.ok) {
          throw new Error("Failed to load team members");
        }

        const data: TeamMemberSummary[] = await response.json();
        setTeamMembers(data);

        if (!project && data.length > 0) {
          setValues((current) =>
            current.teamMemberId
              ? current
              : { ...current, teamMemberId: data[0].id },
          );
        }
      } catch {
        setApiError("Failed to load team members.");
        setTeamMembers([]);
      } finally {
        setIsLoadingTeamMembers(false);
      }
    }

    loadTeamMembers();
  }, [isOpen, project]);

  const handleSubmit = async () => {
    setApiError(null);
    setFieldErrors({});

    const parsed = projectFormSchema.safeParse(values);

    if (!parsed.success) {
      setFieldErrors(mapZodErrors(parsed.error));
      return;
    }
    setIsSubmitting(true);

    try {
      const payload = isEditing
        ? formValuesToUpdatePayload(parsed.data)
        : formValuesToCreatePayload(parsed.data);

      const response = await fetch(
        isEditing ? `/api/projects/${project.id}` : "/api/projects",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          setFieldErrors(mapApiValidationErrors(data.details));
        }

        setApiError(data.error ?? "Failed to save project.");
        return;
      }

      onSaved();
      onClose();
    } catch {
      setApiError("Failed to save project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Project" : "Add Project"}
    >
      {isLoadingTeamMembers ? (
        <p className="text-sm text-zinc-500">Loading team members...</p>
      ) : (
        <ProjectForm
          values={values}
          teamMembers={teamMembers}
          errors={fieldErrors}
          apiError={apiError}
          isSubmitting={isSubmitting}
          submitLabel={isEditing ? "Save changes" : "Create project"}
          onChange={setValues}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}
