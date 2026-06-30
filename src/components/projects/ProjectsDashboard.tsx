"use client";

import { useEffect, useState } from "react";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProjectFilters } from "@/components/projects/ProjectFilters";
import {
  ProjectsTable,
  ProjectsTableSkeleton,
} from "@/components/projects/ProjectsTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Project, ProjectStatusFilter } from "@/types/project";

export function ProjectsDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<ProjectStatusFilter>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

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
  }, [status, debouncedSearch]);

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
          <Button onClick={() => setIsModalOpen(true)}>Add Project</Button>
        </div>

        <ProjectFilters
          search={search}
          status={status}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
        />

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
          <ProjectsTable projects={projects} />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Project"
      >
        <p className="text-sm text-zinc-600">
          Project form fields will be wired up in the next commit.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button disabled>Save</Button>
        </div>
      </Modal>
    </DashboardShell>
  );
}
