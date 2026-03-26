import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@/tests/test-utils";
import { mockTasks } from "@/tests/msw/handlers/tasks";
import TasksPage from "@/features/tasks/pages/TasksPage";

const task1 = mockTasks[0] as (typeof mockTasks)[0];
const task2 = mockTasks[1] as (typeof mockTasks)[0];

describe("TasksPage", () => {
  it("renders the page title", () => {
    render(<TasksPage />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("renders task cards after loading", async () => {
    render(<TasksPage />);
    await waitFor(() => {
      expect(screen.getByText(task1.title)).toBeInTheDocument();
      expect(screen.getByText(task2.title)).toBeInTheDocument();
    });
  });
});
