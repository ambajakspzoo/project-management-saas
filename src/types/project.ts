import { ProjectStatus } from "@prisma/client";

export type TeamMemberSummary = {
  id: string;
  name: string;
  email: string;
};

export type Project = {
  id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  deadline: string;
  budget: string;
  teamMemberId: string;
  teamMember: TeamMemberSummary;
  createdAt: string;
  updatedAt: string;
};

export type ProjectStatusFilter = ProjectStatus | "ALL";

export type ProjectListSortField =
  "title" | "status" | "deadline" | "budget" | "assignee";

export type ProjectListSortOrder = "asc" | "desc";
