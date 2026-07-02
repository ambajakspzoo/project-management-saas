import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { buildProjectOrderBy, buildProjectWhereInput } from "@/lib/projects/query";
import { serializeProject } from "@/lib/serializers/project";
import {
  createProjectSchema,
  projectListQuerySchema,
} from "@/lib/validations/project";

function validationErrorResponse(error: ZodError) {
  return NextResponse.json(
    {
      error: "Validation failed",
      details: error.flatten(),
    },
    { status: 400 },
  );
}

function serverErrorResponse() {
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 },
  );
}

export async function GET(request: NextRequest) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const query = projectListQuerySchema.safeParse({
      status: request.nextUrl.searchParams.get("status") ?? undefined,
      search: request.nextUrl.searchParams.get("search") ?? undefined,
      page: request.nextUrl.searchParams.get("page") ?? undefined,
      limit: request.nextUrl.searchParams.get("limit") ?? undefined,
      sort: request.nextUrl.searchParams.get("sort") ?? undefined,
      order: request.nextUrl.searchParams.get("order") ?? undefined,
    });

    if (!query.success) {
      return validationErrorResponse(query.error);
    }

    const { status, search, page, limit, sort, order } = query.data;
    const where = buildProjectWhereInput({ status, search });
    const orderBy = buildProjectOrderBy(sort, order);
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: { teamMember: true },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json(projects.map(serializeProject), {
      headers: {
        "X-Total-Count": String(total),
        "X-Page": String(page),
        "X-Limit": String(limit),
      },
    });
  } catch {
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const { title, description, status, deadline, budget, teamMemberId } =
      parsed.data;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        status,
        deadline,
        budget,
        teamMemberId,
      },
      include: { teamMember: true },
    });

    return NextResponse.json(serializeProject(project), { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "Team member not found" },
          { status: 400 },
        );
      }
    }

    return serverErrorResponse();
  }
}
