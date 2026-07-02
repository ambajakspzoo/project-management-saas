// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Pagination } from "@/components/ui/Pagination";

describe("Pagination", () => {
  it("renders the current range and total count", () => {
    render(
      <Pagination
        page={2}
        pageSize={10}
        totalCount={42}
        onPageChange={vi.fn()}
        itemLabel="projects"
      />,
    );

    expect(screen.getByText(/Showing/)).toHaveTextContent(
      "Showing 11–20 of 42 projects",
    );
    expect(screen.getByText(/Page/)).toHaveTextContent("Page 2 of 5");
  });

  it("calls onPageChange for previous and next actions", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <Pagination
        page={2}
        pageSize={10}
        totalCount={42}
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Previous page" }));
    await user.click(screen.getByRole("button", { name: "Next page" }));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
  });

  it("disables navigation at the boundaries", () => {
    render(
      <Pagination
        page={1}
        pageSize={10}
        totalCount={42}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).not.toBeDisabled();
  });

  it("hides controls when there is only one page", () => {
    render(
      <Pagination
        page={1}
        pageSize={10}
        totalCount={8}
        onPageChange={vi.fn()}
        itemLabel="projects"
      />,
    );

    expect(screen.getByText(/Showing/)).toHaveTextContent(
      "Showing 1–8 of 8 projects",
    );
    expect(screen.queryByRole("button", { name: "Previous page" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next page" })).not.toBeInTheDocument();
  });
});
