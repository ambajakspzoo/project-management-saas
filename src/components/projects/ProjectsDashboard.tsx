"use client";

import { useEffect, useRef, useState } from "react";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { DeleteProjectDialog } from "@/components/projects/DeleteProjectDialog";
import { ProjectFilters } from "@/components/projects/ProjectFilters";
import { ProjectFormModal } from "@/components/projects/ProjectFormModal";
import {
  ProjectsTable,
  ProjectsTableSkeleton,
} from "@/components/projects/ProjectsTable";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { PROJECTS_PAGE_SIZE } from "@/lib/projects/constants";
import { Project, ProjectStatusFilter } from "@/types/project";

type Feedback = {
  type: "success" | "error";
  message: string;
};

export function ProjectsDashboard({ userEmail }: { userEmail?: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const projectsRef = useRef<Project[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<ProjectStatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const isMutating = isDeleting || isSaving;
  const isBusy = isMutating || isRefetching || isInitialLoading;
  const hasActiveFilters = search.length > 0 || status !== "ALL";

  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [status, debouncedSearch]);

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
      const isRefetch = projectsRef.current.length > 0;

      if (isRefetch) {
        setIsRefetching(true);
      } else {
        setIsInitialLoading(true);
        setError(null);
      }

      try {
        const params = new URLSearchParams();

        if (status !== "ALL") {
          params.set("status", status);
        }

        if (debouncedSearch) {
          params.set("search", debouncedSearch);
        }

        params.set("page", String(page));
        params.set("limit", String(PROJECTS_PAGE_SIZE));

        const query = params.toString();
        const response = await fetch(
          `/api/projects${query ? `?${query}` : ""}`,
        );

        if (!response.ok) {
          throw new Error("Failed to load projects");
        }

        const total = Number(response.headers.get("X-Total-Count") ?? "0");
        const totalPages = Math.max(1, Math.ceil(total / PROJECTS_PAGE_SIZE));

        if (page > totalPages) {
          setPage(totalPages);
          return;
        }

        const data: Project[] = await response.json();
        setProjects(data);
        setTotalCount(total);
        setError(null);
      } catch {
        if (projectsRef.current.length === 0) {
          setError("Failed to load projects. Please try again.");
          setProjects([]);
        } else {
          setFeedback({
            type: "error",
            message: "Failed to refresh projects. Showing the last loaded data.",
          });
        }
      } finally {
        setIsInitialLoading(false);
        setIsRefetching(false);
      }
    }

    loadProjects();
  }, [status, debouncedSearch, page, refreshKey]);

  const retryLoad = () => {
    setRefreshKey((current) => current + 1);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("ALL");
    setPage(1);
  };

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
    if (!isSaving) {
      setIsFormOpen(false);
      setEditingProject(null);
    }
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
    <DashboardShell userEmail={userEmail}>
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
          <Button onClick={openCreateModal} disabled={isBusy}>
            Add Project
          </Button>
        </div>

        <ProjectFilters
          search={search}
          status={status}
          disabled={isMutating || isInitialLoading}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
        />

        {feedback ? (
          <div
            role="status"
            className={
              feedback.type === "success"
                ? "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                : "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            }
          >
            {feedback.message}
          </div>
        ) : null}

        {isInitialLoading ? (
          <ProjectsTableSkeleton />
        ) : error ? (
          <ErrorMessage message={error} onRetry={retryLoad} />
        ) : totalCount === 0 ? (
          <EmptyState
            title="No projects found"
            description={
              hasActiveFilters
                ? "No projects match your current search or status filter."
                : "Get started by adding your first project to the dashboard."
            }
            action={
              hasActiveFilters
                ? { label: "Clear filters", onClick: clearFilters }
                : { label: "Add project", onClick: openCreateModal }
            }
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  d="M4 7h16M4 12h16M4 17h10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            }
          />
        ) : (
          <ProjectsTable
            projects={projects}
            onEdit={openEditModal}
            onDelete={openDeleteDialog}
            deletingProjectId={isDeleting ? deletingProject?.id : null}
            isRefetching={isRefetching}
            disabled={isMutating}
            page={page}
            pageSize={PROJECTS_PAGE_SIZE}
            totalCount={totalCount}
            onPageChange={setPage}
          />
        )}
      </div>

      <ProjectFormModal
        key={formKey}
        isOpen={isFormOpen}
        project={editingProject}
        onClose={closeFormModal}
        onSaved={handleProjectSaved}
        onSubmittingChange={setIsSaving}
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
