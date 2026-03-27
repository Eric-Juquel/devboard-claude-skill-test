import { http, HttpResponse } from "msw";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const mockProjects = [
  {
    id: "1",
    name: "DevBoard Core",
    description: "Main tracking application",
    status: "active" as const,
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Mobile Companion",
    description: "React Native mobile app",
    status: "active" as const,
    createdAt: "2026-02-01T09:00:00Z",
  },
];

export const projectHandlers = [
  http.get(`${API_URL}/projects`, () => HttpResponse.json(mockProjects)),

  http.post(`${API_URL}/projects`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      { id: "new-project-id", createdAt: new Date().toISOString(), ...body },
      { status: 201 },
    );
  }),

  http.put(`${API_URL}/projects/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const existing = mockProjects.find((p) => p.id === params.id);
    return HttpResponse.json({ ...existing, ...body, id: params.id });
  }),

  http.delete(`${API_URL}/projects/:id`, () => new HttpResponse(null, { status: 204 })),
];
