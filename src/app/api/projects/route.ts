import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { prisma } from "@/lib/prisma";
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
  try {
    const query = projectListQuerySchema.safeParse({
      status: request.nextUrl.searchParams.get("status") ?? undefined,
      search: request.nextUrl.searchParams.get("search") ?? undefined,
    });

    if (!query.success) {
      return validationErrorResponse(query.error);
    }

    const { status, search } = query.data;
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

    const projects = await prisma.project.findMany({
      where,
      include: { teamMember: true },
      orderBy: { deadline: "asc" },
    });

    return NextResponse.json(projects.map(serializeProject));
  } catch {
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
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
