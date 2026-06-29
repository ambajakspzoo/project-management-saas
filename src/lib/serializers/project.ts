import { Project, TeamMember } from "@prisma/client";

export type ProjectWithTeamMember = Project & {
  teamMember: TeamMember;
};

export function serializeProject(project: ProjectWithTeamMember) {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    status: project.status,
    deadline: project.deadline.toISOString(),
    budget: project.budget.toString(),
    teamMemberId: project.teamMemberId,
    teamMember: project.teamMember,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}
