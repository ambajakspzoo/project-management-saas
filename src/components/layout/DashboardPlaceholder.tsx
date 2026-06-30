"use client";

import { useState } from "react";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function DashboardPlaceholder() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl space-y-8">
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

        <div className="flex flex-wrap gap-2">
          <StatusBadge status="ACTIVE" />
          <StatusBadge status="ON_HOLD" />
          <StatusBadge status="COMPLETED" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input label="Search" placeholder="Search projects..." disabled />
          <Select label="Status" disabled defaultValue="ACTIVE">
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On hold</option>
            <option value="COMPLETED">Completed</option>
          </Select>
        </div>

        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="text-sm font-medium text-zinc-900">
            Project table coming next
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            The projects list with filters will be added in the next step.
          </p>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Project"
      >
        <p className="text-sm text-zinc-600">
          Project form fields will be wired up in a later commit.
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
