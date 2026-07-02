import { ProjectStatus } from "@prisma/client";
import { z } from "zod";

export const projectStatusSchema = z.nativeEnum(ProjectStatus);

export const projectListQuerySchema = z.object({
  status: projectStatusSchema.optional(),
  search: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
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

export const updateProjectSchema = createProjectSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
