import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DELETE, GET, PATCH } from "@/app/api/projects/[id]/route";
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
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const routeContext = {
  params: Promise.resolve({ id: "project-1" }),
};

describe("GET /api/projects/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockUnauthorizedResponse());

    const response = await GET(
      createApiRequest("/api/projects/project-1"),
      routeContext,
    );
    const { status, body } = await readJsonResponse<{ error: string }>(
      response,
    );

    expect(status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns a single project", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockAuthenticatedSession());
    vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject);

    const response = await GET(
      createApiRequest("/api/projects/project-1"),
      routeContext,
    );
    const { status, body } = await readJsonResponse<{ id: string }>(response);

    expect(status).toBe(200);
    expect(body.id).toBe("project-1");
  });

  it("returns 404 when project is missing", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockAuthenticatedSession());
    vi.mocked(prisma.project.findUnique).mockResolvedValue(null);

    const response = await GET(createApiRequest("/api/projects/missing"), {
      params: Promise.resolve({ id: "missing" }),
    });
    const { status, body } = await readJsonResponse<{ error: string }>(
      response,
    );

    expect(status).toBe(404);
    expect(body.error).toBe("Project not found");
  });
});

describe("PATCH /api/projects/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.project.update).mockReset();
  });

  it("updates a project", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockAuthenticatedSession());
    vi.mocked(prisma.project.update).mockResolvedValue({
      ...mockProject,
      title: "Updated Title",
    });

    const response = await PATCH(
      createApiRequest("/api/projects/project-1", {
        method: "PATCH",
        body: JSON.stringify({ title: "Updated Title" }),
        headers: { "Content-Type": "application/json" },
      }),
      routeContext,
    );
    const { status, body } = await readJsonResponse<{ title: string }>(
      response,
    );

    expect(status).toBe(200);
    expect(body.title).toBe("Updated Title");
  });

  it("returns 400 for invalid update payload", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockAuthenticatedSession());

    const response = await PATCH(
      createApiRequest("/api/projects/project-1", {
        method: "PATCH",
        body: JSON.stringify({ budget: -100 }),
        headers: { "Content-Type": "application/json" },
      }),
      routeContext,
    );
    const { status, body } = await readJsonResponse<{ error: string }>(
      response,
    );

    expect(status).toBe(400);
    expect(body.error).toBe("Validation failed");
    expect(prisma.project.update).not.toHaveBeenCalled();
  });

  it("returns 404 when project does not exist", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockAuthenticatedSession());
    vi.mocked(prisma.project.update).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Record not found", {
        code: "P2025",
        clientVersion: "6.19.3",
      }),
    );

    const response = await PATCH(
      createApiRequest("/api/projects/missing", {
        method: "PATCH",
        body: JSON.stringify({ title: "Updated Title" }),
        headers: { "Content-Type": "application/json" },
      }),
      { params: Promise.resolve({ id: "missing" }) },
    );
    const { status, body } = await readJsonResponse<{ error: string }>(
      response,
    );

    expect(status).toBe(404);
    expect(body.error).toBe("Project not found");
  });
});

describe("DELETE /api/projects/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a project", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockAuthenticatedSession());
    vi.mocked(prisma.project.delete).mockResolvedValue(mockProject);

    const response = await DELETE(
      createApiRequest("/api/projects/project-1", {
        method: "DELETE",
      }),
      routeContext,
    );
    const { status, body } = await readJsonResponse<{ message: string }>(
      response,
    );

    expect(status).toBe(200);
    expect(body.message).toBe("Project deleted");
    expect(prisma.project.delete).toHaveBeenCalledWith({
      where: { id: "project-1" },
    });
  });

  it("returns 404 when project does not exist", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockAuthenticatedSession());
    vi.mocked(prisma.project.delete).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Record not found", {
        code: "P2025",
        clientVersion: "6.19.3",
      }),
    );

    const response = await DELETE(
      createApiRequest("/api/projects/missing", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ id: "missing" }) },
    );
    const { status, body } = await readJsonResponse<{ error: string }>(
      response,
    );

    expect(status).toBe(404);
    expect(body.error).toBe("Project not found");
  });
});
