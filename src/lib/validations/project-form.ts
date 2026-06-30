import { ProjectStatus } from "@prisma/client";
import { z } from "zod";

import { projectStatusSchema } from "@/lib/validations/project";
import { Project } from "@/types/project";

export const projectFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000),
  status: projectStatusSchema,
  deadline: z.string().min(1, "Deadline is required"),
  budget: z
    .string()
    .min(1, "Budget is required")
    .refine(
      (value) => !Number.isNaN(Number(value)) && Number(value) > 0,
      "Budget must be greater than zero",
    ),
  teamMemberId: z.string().min(1, "Team member is required"),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const emptyProjectFormValues: ProjectFormValues = {
  title: "",
  description: "",
  status: ProjectStatus.ACTIVE,
  deadline: "",
  budget: "",
  teamMemberId: "",
};

export function projectToFormValues(project: Project): ProjectFormValues {
  return {
    title: project.title,
    description: project.description ?? "",
    status: project.status,
    deadline: project.deadline.slice(0, 10),
    budget: project.budget,
    teamMemberId: project.teamMemberId,
  };
}

export function formValuesToCreatePayload(values: ProjectFormValues) {
  return {
    title: values.title,
    description: values.description || null,
    status: values.status,
    deadline: values.deadline,
    budget: Number(values.budget),
    teamMemberId: values.teamMemberId,
  };
}

export function formValuesToUpdatePayload(values: ProjectFormValues) {
  return formValuesToCreatePayload(values);
}

export function mapZodErrors(
  error: z.ZodError<ProjectFormValues>,
): Partial<Record<keyof ProjectFormValues, string>> {
  const fieldErrors: Partial<Record<keyof ProjectFormValues, string>> = {};

  for (const [key, messages] of Object.entries(error.flatten().fieldErrors)) {
    if (messages?.[0]) {
      fieldErrors[key as keyof ProjectFormValues] = messages[0];
    }
  }

  return fieldErrors;
}

export function mapApiValidationErrors(
  details: {
    fieldErrors?: Record<string, string[] | undefined>;
  },
): Partial<Record<keyof ProjectFormValues, string>> {
  const fieldErrors: Partial<Record<keyof ProjectFormValues, string>> = {};

  if (!details.fieldErrors) {
    return fieldErrors;
  }

  for (const [key, messages] of Object.entries(details.fieldErrors)) {
    if (messages?.[0]) {
      fieldErrors[key as keyof ProjectFormValues] = messages[0];
    }
  }

  return fieldErrors;
}
