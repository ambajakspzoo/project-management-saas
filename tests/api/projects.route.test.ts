import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "@/app/api/projects/route";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

import {
  createApiRequest,
  mockAuthenticatedSession,
  mockProject,
  mockUnauthorizedResponse,
  readJsonResponse,
} from "../helpers/api";

vi.mock("@/lib/api-auth", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("GET /api/projects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockUnauthorizedResponse());

    const response = await GET(createApiRequest("/api/projects"));
    const { status, body } = await readJsonResponse<{ error: string }>(response);

    expect(status).toBe(401);
    expect(body.error).toBe("Unauthorized");
    expect(prisma.project.findMany).not.toHaveBeenCalled();
  });

  it("returns serialized projects when authenticated", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockAuthenticatedSession());
    vi.mocked(prisma.project.findMany).mockResolvedValue([mockProject]);
    vi.mocked(prisma.project.count).mockResolvedValue(1);

    const response = await GET(createApiRequest("/api/projects"));
    const { status, body } = await readJsonResponse<typeof mockProject[]>(response);

    expect(status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0].title).toBe(mockProject.title);
    expect(body[0].budget).toBe("85000");
    expect(body[0].teamMember.name).toBe("Alice Chen");
    expect(response.headers.get("X-Total-Count")).toBe("1");
    expect(response.headers.get("X-Page")).toBe("1");
    expect(response.headers.get("X-Limit")).toBe("10");
  });

  it("applies status and search filters", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockAuthenticatedSession());
    vi.mocked(prisma.project.findMany).mockResolvedValue([]);
    vi.mocked(prisma.project.count).mockResolvedValue(0);

    await GET(
      createApiRequest("/api/projects?status=ACTIVE&search=portal"),
    );

    expect(prisma.project.findMany).toHaveBeenCalledWith({
      where: {
        status: "ACTIVE",
        OR: [
          { title: { contains: "portal", mode: "insensitive" } },
          { description: { contains: "portal", mode: "insensitive" } },
        ],
      },
      include: { teamMember: true },
      orderBy: { deadline: "asc" },
      skip: 0,
      take: 10,
    });
    expect(prisma.project.count).toHaveBeenCalledWith({
      where: {
        status: "ACTIVE",
        OR: [
          { title: { contains: "portal", mode: "insensitive" } },
          { description: { contains: "portal", mode: "insensitive" } },
        ],
      },
    });
  });

  it("applies pagination query params", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockAuthenticatedSession());
    vi.mocked(prisma.project.findMany).mockResolvedValue([]);
    vi.mocked(prisma.project.count).mockResolvedValue(42);

    const response = await GET(
      createApiRequest("/api/projects?page=2&limit=10"),
    );

    expect(prisma.project.findMany).toHaveBeenCalledWith({
      where: {},
      include: { teamMember: true },
      orderBy: { deadline: "asc" },
      skip: 10,
      take: 10,
    });
    expect(response.headers.get("X-Total-Count")).toBe("42");
    expect(response.headers.get("X-Page")).toBe("2");
    expect(response.headers.get("X-Limit")).toBe("10");
  });

  it("returns 400 for invalid pagination query", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockAuthenticatedSession());

    const response = await GET(
      createApiRequest("/api/projects?page=0&limit=10"),
    );
    const { status, body } = await readJsonResponse<{ error: string }>(response);

    expect(status).toBe(400);
    expect(body.error).toBe("Validation failed");
    expect(prisma.project.findMany).not.toHaveBeenCalled();
    expect(prisma.project.count).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid status query", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockAuthenticatedSession());

    const response = await GET(
      createApiRequest("/api/projects?status=INVALID"),
    );
    const { status, body } = await readJsonResponse<{ error: string }>(response);

    expect(status).toBe(400);
    expect(body.error).toBe("Validation failed");
    expect(prisma.project.findMany).not.toHaveBeenCalled();
  });

  it("applies sorting query params", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockAuthenticatedSession());
    vi.mocked(prisma.project.findMany).mockResolvedValue([]);
    vi.mocked(prisma.project.count).mockResolvedValue(0);

    await GET(
      createApiRequest("/api/projects?sort=deadline&order=asc"),
    );

    expect(prisma.project.findMany).toHaveBeenCalledWith({
      where: {},
      include: { teamMember: true },
      orderBy: { deadline: "asc" },
      skip: 0,
      take: 10,
    });
  });

  it("sorts by assignee using the team member relation", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockAuthenticatedSession());
    vi.mocked(prisma.project.findMany).mockResolvedValue([]);
    vi.mocked(prisma.project.count).mockResolvedValue(0);

    await GET(
      createApiRequest("/api/projects?sort=assignee&order=desc"),
    );

    expect(prisma.project.findMany).toHaveBeenCalledWith({
      where: {},
      include: { teamMember: true },
      orderBy: { teamMember: { name: "desc" } },
      skip: 0,
      take: 10,
    });
  });

  it("returns 400 for invalid sort query", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockAuthenticatedSession());

    const response = await GET(
      createApiRequest("/api/projects?sort=invalid&order=asc"),
    );
    const { status, body } = await readJsonResponse<{ error: string }>(response);

    expect(status).toBe(400);
    expect(body.error).toBe("Validation failed");
    expect(prisma.project.findMany).not.toHaveBeenCalled();
  });
});

describe("POST /api/projects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockUnauthorizedResponse());

    const response = await POST(
      createApiRequest("/api/projects", {
        method: "POST",
        body: JSON.stringify({ title: "New Project" }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    const { status, body } = await readJsonResponse<{ error: string }>(response);

    expect(status).toBe(401);
    expect(body.error).toBe("Unauthorized");
    expect(prisma.project.create).not.toHaveBeenCalled();
  });

  it("creates a project and returns 201", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockAuthenticatedSession());
    vi.mocked(prisma.project.create).mockResolvedValue(mockProject);

    const response = await POST(
      createApiRequest("/api/projects", {
        method: "POST",
        body: JSON.stringify({
          title: "New Project",
          description: "A new project",
          status: "ACTIVE",
          deadline: "2026-12-31",
          budget: 25000,
          teamMemberId: "member-1",
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    const { status, body } = await readJsonResponse<{ title: string }>(response);

    expect(status).toBe(201);
    expect(body.title).toBe(mockProject.title);
    expect(prisma.project.create).toHaveBeenCalledWith({
      data: {
        title: "New Project",
        description: "A new project",
        status: "ACTIVE",
        deadline: expect.any(Date),
        budget: 25000,
        teamMemberId: "member-1",
      },
      include: { teamMember: true },
    });
  });

  it("returns 400 for invalid payload", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockAuthenticatedSession());

    const response = await POST(
      createApiRequest("/api/projects", {
        method: "POST",
        body: JSON.stringify({ title: "" }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    const { status, body } = await readJsonResponse<{ error: string }>(response);

    expect(status).toBe(400);
    expect(body.error).toBe("Validation failed");
    expect(prisma.project.create).not.toHaveBeenCalled();
  });

  it("returns 400 when team member does not exist", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockAuthenticatedSession());
    vi.mocked(prisma.project.create).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Foreign key constraint failed", {
        code: "P2003",
        clientVersion: "6.19.3",
      }),
    );

    const response = await POST(
      createApiRequest("/api/projects", {
        method: "POST",
        body: JSON.stringify({
          title: "New Project",
          status: "ACTIVE",
          deadline: "2026-12-31",
          budget: 25000,
          teamMemberId: "missing-member",
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    const { status, body } = await readJsonResponse<{ error: string }>(response);

    expect(status).toBe(400);
    expect(body.error).toBe("Team member not found");
  });
});
