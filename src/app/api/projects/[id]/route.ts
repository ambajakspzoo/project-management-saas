import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { serializeProject } from "@/lib/serializers/project";
import { updateProjectSchema } from "@/lib/validations/project";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function validationErrorResponse(error: ZodError) {
  return NextResponse.json(
    {
      error: "Validation failed",
      details: error.flatten(),
    },
    { status: 400 },
  );
}

function notFoundResponse() {
  return NextResponse.json({ error: "Project not found" }, { status: 404 });
}

function serverErrorResponse() {
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

function handlePrismaError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return notFoundResponse();
    }

    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 400 },
      );
    }
  }

  return serverErrorResponse();
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id } = await context.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: { teamMember: true },
    });

    if (!project) {
      return notFoundResponse();
    }

    return NextResponse.json(serializeProject(project));
  } catch {
    return serverErrorResponse();
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateProjectSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const project = await prisma.project.update({
      where: { id },
      data: parsed.data,
      include: { teamMember: true },
    });

    return NextResponse.json(serializeProject(project));
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id } = await context.params;

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Project deleted" });
  } catch (error) {
    return handlePrismaError(error);
  }
}
