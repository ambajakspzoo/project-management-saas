"use client";

import { useEffect, useState } from "react";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { DeleteProjectDialog } from "@/components/projects/DeleteProjectDialog";
import { ProjectFilters } from "@/components/projects/ProjectFilters";
import { ProjectFormModal } from "@/components/projects/ProjectFormModal";
import {
  ProjectsTable,
  ProjectsTableSkeleton,
} from "@/components/projects/ProjectsTable";
import { Button } from "@/components/ui/Button";
import { Project, ProjectStatusFilter } from "@/types/project";

type Feedback = {
  type: "success" | "error";
  message: string;
};

export function ProjectsDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<ProjectStatusFilter>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (feedback?.type !== "success") {
      return;
    }

    const timer = window.setTimeout(() => {
      setFeedback(null);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    async function loadProjects() {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        if (status !== "ALL") {
          params.set("status", status);
        }

        if (debouncedSearch) {
          params.set("search", debouncedSearch);
        }

        const query = params.toString();
        const response = await fetch(
          `/api/projects${query ? `?${query}` : ""}`,
        );

        if (!response.ok) {
          throw new Error("Failed to load projects");
        }

        const data: Project[] = await response.json();
        setProjects(data);
      } catch {
        setError("Failed to load projects. Please try again.");
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadProjects();
  }, [status, debouncedSearch, refreshKey]);

  const openCreateModal = () => {
    setEditingProject(null);
    setFormKey((current) => current + 1);
    setIsFormOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormKey((current) => current + 1);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setEditingProject(null);
  };

  const handleProjectSaved = () => {
    setRefreshKey((current) => current + 1);
    setFeedback({ type: "success", message: "Project saved successfully." });
  };

  const openDeleteDialog = (project: Project) => {
    setDeletingProject(project);
  };

  const closeDeleteDialog = () => {
    if (!isDeleting) {
      setDeletingProject(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProject) {
      return;
    }

    const projectTitle = deletingProject.title;
    setIsDeleting(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/projects/${deletingProject.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      setDeletingProject(null);
      setRefreshKey((current) => current + 1);
      setFeedback({
        type: "success",
        message: `"${projectTitle}" was deleted.`,
      });
    } catch {
      setFeedback({
        type: "error",
        message: "Failed to delete project. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              Projects
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Track status, deadlines, budgets, and assigned team members.
            </p>
          </div>
          <Button onClick={openCreateModal}>Add Project</Button>
        </div>

        <ProjectFilters
          search={search}
          status={status}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
        />

        {feedback ? (
          <div
            className={
              feedback.type === "success"
                ? "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                : "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            }
          >
            {feedback.message}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <ProjectsTableSkeleton />
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white px-6 py-12 text-center">
            <p className="text-sm font-medium text-zinc-900">
              No projects found
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {search || status !== "ALL"
                ? "Try adjusting your search or filters."
                : "Get started by adding your first project."}
            </p>
          </div>
        ) : (
          <ProjectsTable
            projects={projects}
            onEdit={openEditModal}
            onDelete={openDeleteDialog}
            deletingProjectId={isDeleting ? deletingProject?.id : null}
          />
        )}
      </div>

      <ProjectFormModal
        key={formKey}
        isOpen={isFormOpen}
        project={editingProject}
        onClose={closeFormModal}
        onSaved={handleProjectSaved}
      />

      <DeleteProjectDialog
        project={deletingProject}
        isDeleting={isDeleting}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteConfirm}
      />
    </DashboardShell>
  );
}
