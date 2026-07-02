// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProjectForm } from "@/components/projects/ProjectForm";

import { mockFormValues, mockTeamMemberSummary } from "../helpers/components";

function renderProjectForm(
  overrides: Partial<Parameters<typeof ProjectForm>[0]> = {},
) {
  const onChange = vi.fn();
  const onSubmit = vi.fn();
  const onCancel = vi.fn();

  render(
    <ProjectForm
      values={mockFormValues}
      teamMembers={[mockTeamMemberSummary]}
      errors={{}}
      apiError={null}
      isSubmitting={false}
      submitLabel="Create project"
      onChange={onChange}
      onSubmit={onSubmit}
      onCancel={onCancel}
      {...overrides}
    />,
  );

  return { onChange, onSubmit, onCancel };
}

describe("ProjectForm", () => {
  it("renders project form fields", () => {
    renderProjectForm();

    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
    expect(screen.getByLabelText("Deadline")).toBeInTheDocument();
    expect(screen.getByLabelText("Team member")).toBeInTheDocument();
    expect(screen.getByLabelText("Budget")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create project" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("displays current form values", () => {
    renderProjectForm();

    expect(screen.getByLabelText("Title")).toHaveValue("Customer Portal Redesign");
    expect(screen.getByLabelText("Description")).toHaveValue(
      "Modernize the customer portal",
    );
    expect(screen.getByLabelText("Deadline")).toHaveValue("2026-12-31");
    expect(screen.getByLabelText("Budget")).toHaveValue(85000);
    expect(screen.getByLabelText("Team member")).toHaveValue("member-1");
  });

  it("shows validation and api errors", () => {
    renderProjectForm({
      errors: { title: "Title is required" },
      apiError: "Failed to save project.",
    });

    expect(screen.getByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Failed to save project.")).toBeInTheDocument();
  });

  it("calls onSubmit when the form is submitted", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderProjectForm();

    await user.click(screen.getByRole("button", { name: "Create project" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when cancel is clicked", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderProjectForm();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("disables actions while submitting", () => {
    renderProjectForm({ isSubmitting: true, submitLabel: "Create project" });

    expect(screen.getByLabelText("Title")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });
});
