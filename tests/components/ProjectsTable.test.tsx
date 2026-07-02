// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProjectsTable } from "@/components/projects/ProjectsTable";

import { mockUiProject } from "../helpers/components";

function renderProjectsTable(
  overrides: Partial<Parameters<typeof ProjectsTable>[0]> = {},
) {
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  render(
    <ProjectsTable
      projects={[mockUiProject]}
      onEdit={onEdit}
      onDelete={onDelete}
      {...overrides}
    />,
  );

  return { onEdit, onDelete };
}

describe("ProjectsTable", () => {
  it("renders table headers and project data", () => {
    renderProjectsTable();

    expect(
      screen.getByRole("columnheader", { name: "Title" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Status" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Deadline" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Assignee" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Budget" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Actions" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Customer Portal Redesign")).toBeInTheDocument();
    expect(
      screen.getByText("Modernize the customer portal"),
    ).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Alice Chen")).toBeInTheDocument();
    expect(screen.getByText("$85,000")).toBeInTheDocument();
  });

  it("calls onEdit and onDelete for row actions", async () => {
    const user = userEvent.setup();
    const { onEdit, onDelete } = renderProjectsTable();

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(onEdit).toHaveBeenCalledWith(mockUiProject);
    expect(onDelete).toHaveBeenCalledWith(mockUiProject);
  });

  it("shows a refetching overlay", () => {
    renderProjectsTable({ isRefetching: true });

    expect(screen.getByText("Updating projects...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
  });

  it("calls onSortChange when a sortable column header is clicked", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();

    renderProjectsTable({
      sort: "deadline",
      order: "asc",
      onSortChange,
    });

    await user.click(screen.getByRole("button", { name: "Budget" }));

    expect(onSortChange).toHaveBeenCalledWith("budget");
  });

  it("shows the active sort direction on the current column", () => {
    renderProjectsTable({
      sort: "deadline",
      order: "desc",
      onSortChange: vi.fn(),
    });

    expect(
      screen.getByRole("columnheader", { name: "Deadline" }),
    ).toHaveAttribute("aria-sort", "descending");
    expect(screen.getByRole("button", { name: "Deadline" })).toHaveTextContent(
      "↓",
    );
  });
});
