import { ProjectStatus } from "@prisma/client";

import { emptyProjectFormValues } from "@/lib/validations/project-form";
import { Project, TeamMemberSummary } from "@/types/project";

export const mockTeamMemberSummary: TeamMemberSummary = {
  id: "member-1",
  name: "Alice Chen",
  email: "alice@example.com",
};

export const mockUiProject: Project = {
  id: "project-1",
  title: "Customer Portal Redesign",
  description: "Modernize the customer portal",
  status: ProjectStatus.ACTIVE,
  deadline: "2026-12-31T00:00:00.000Z",
  budget: "85000",
  teamMemberId: mockTeamMemberSummary.id,
  teamMember: mockTeamMemberSummary,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

export const mockFormValues = {
  ...emptyProjectFormValues,
  title: "Customer Portal Redesign",
  description: "Modernize the customer portal",
  status: ProjectStatus.ACTIVE,
  deadline: "2026-12-31",
  budget: "85000",
  teamMemberId: mockTeamMemberSummary.id,
};
