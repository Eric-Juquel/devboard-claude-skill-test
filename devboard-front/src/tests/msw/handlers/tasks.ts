import { http, HttpResponse } from "msw";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const mockTasks = [
  {
    id: "b0000000-0000-0000-0000-000000000001",
    title: "Setup CI/CD pipeline",
    description: "Configure GitHub Actions",
    status: "done" as const,
    priority: "high" as const,
    projectId: "a0000000-0000-0000-0000-000000000001",
    createdAt: "2026-01-16T10:00:00Z",
    updatedAt: "2026-01-16T10:00:00Z",
  },
  {
    id: "b0000000-0000-0000-0000-000000000002",
    title: "Design system tokens",
    description: "Define and document the color palette",
    status: "in-progress" as const,
    priority: "medium" as const,
    projectId: "a0000000-0000-0000-0000-000000000001",
    createdAt: "2026-01-17T10:00:00Z",
    updatedAt: "2026-01-17T10:00:00Z",
  },
  {
    id: "b0000000-0000-0000-0000-000000000003",
    title: "JWT authentication flow",
    description: "Implement login and token refresh",
    status: "todo" as const,
    priority: "high" as const,
    projectId: "a0000000-0000-0000-0000-000000000002",
    createdAt: "2026-02-02T09:00:00Z",
    updatedAt: "2026-02-02T09:00:00Z",
  },
];

export const taskHandlers = [
  http.get(`${API_URL}/tasks`, () => HttpResponse.json(mockTasks)),

  http.post(`${API_URL}/tasks`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const now = new Date().toISOString();
    return HttpResponse.json(
      { id: "b0000000-0000-0000-0000-000000000099", createdAt: now, updatedAt: now, ...body },
      { status: 201 },
    );
  }),

  http.patch(`${API_URL}/tasks/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const existing = mockTasks.find((t) => t.id === params.id);
    return HttpResponse.json({ ...existing, ...body, id: params.id, updatedAt: new Date().toISOString() });
  }),

  http.delete(`${API_URL}/tasks/:id`, () => new HttpResponse(null, { status: 204 })),
];
