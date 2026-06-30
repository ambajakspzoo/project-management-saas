"use client";

import { Project } from "@/types/project";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

type DeleteProjectDialogProps = {
  project: Project | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteProjectDialog({
  project,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteProjectDialogProps) {
  return (
    <Modal
      isOpen={project !== null}
      onClose={isDeleting ? () => undefined : onClose}
      title="Delete project"
      className="max-w-md"
    >
      <p className="text-sm text-zinc-600">
        Are you sure you want to delete{" "}
        <span className="font-medium text-zinc-900">
          {project?.title ?? "this project"}
        </span>
        ? This action cannot be undone.
      </p>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </Modal>
  );
}
