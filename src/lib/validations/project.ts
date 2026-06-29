import { ProjectStatus } from "@prisma/client";
import { z } from "zod";

export const projectStatusSchema = z.nativeEnum(ProjectStatus);

export const projectListQuerySchema = z.object({
  status: projectStatusSchema.optional(),
  search: z.string().trim().min(1).optional(),
});

export const createProjectSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .nullable()
    .transform((value) => value ?? null),
  status: projectStatusSchema.optional().default(ProjectStatus.ACTIVE),
  deadline: z.coerce.date(),
  budget: z.coerce.number().positive("Budget must be greater than zero"),
  teamMemberId: z.string().trim().min(1, "Team member is required"),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
