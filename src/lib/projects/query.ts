import { Prisma, ProjectStatus } from "@prisma/client";

import type {
  ProjectListSortField,
  ProjectListSortOrder,
} from "@/types/project";

export function buildProjectWhereInput({
  status,
  search,
}: {
  status?: ProjectStatus;
  search?: string;
}): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  return where;
}

export function buildProjectOrderBy(
  sort: ProjectListSortField,
  order: ProjectListSortOrder,
): Prisma.ProjectOrderByWithRelationInput {
  if (sort === "assignee") {
    return { teamMember: { name: order } };
  }

  return { [sort]: order };
}
