import { Prisma, ProjectStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

/** Dummy origin — route handlers only use pathname and search params. */
const TEST_API_ORIGIN = "https://test.local";

export const mockTeamMember = {
  id: "member-1",
  name: "Alice Chen",
  email: "alice@example.com",
};

export const mockProject = {
  id: "project-1",
  title: "Customer Portal Redesign",
  description: "Modernize the customer portal",
  status: ProjectStatus.ACTIVE,
  deadline: new Date("2026-12-31T00:00:00.000Z"),
  budget: new Prisma.Decimal("85000"),
  teamMemberId: mockTeamMember.id,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  teamMember: mockTeamMember,
};

export function createApiRequest(
  path: string,
  init?: RequestInit,
): NextRequest {
  return new NextRequest(new URL(path, TEST_API_ORIGIN), init);
}

export async function readJsonResponse<T>(response: Response): Promise<{
  status: number;
  body: T;
}> {
  return {
    status: response.status,
    body: (await response.json()) as T,
  };
}

export function mockAuthenticatedSession() {
  return {
    session: {
      user: {
        email: "admin@example.com",
        name: "Demo User",
      },
    },
    unauthorized: null,
  };
}

export function mockUnauthorizedResponse() {
  return {
    session: null,
    unauthorized: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
  };
}
