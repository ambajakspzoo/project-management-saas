import { Prisma, ProjectStatus } from "@prisma/client";

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
