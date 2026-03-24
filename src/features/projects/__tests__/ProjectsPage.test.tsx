import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@/tests/test-utils";
import { mockProjects } from "@/tests/msw/handlers/projects";
import ProjectsPage from "@/features/projects/pages/ProjectsPage";

const project1 = mockProjects[0] as (typeof mockProjects)[0];
const project2 = mockProjects[1] as (typeof mockProjects)[0];

describe("ProjectsPage", () => {
  it("renders the page title", () => {
    render(<ProjectsPage />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("renders project cards after loading", async () => {
    render(<ProjectsPage />);
    await waitFor(() => {
      expect(screen.getByText(project1.name)).toBeInTheDocument();
      expect(screen.getByText(project2.name)).toBeInTheDocument();
    });
  });

  it("renders the create project form", async () => {
    render(<ProjectsPage />);
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });
  });
});
