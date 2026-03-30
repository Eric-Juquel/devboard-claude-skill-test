import { HttpResponse, http } from 'msw';
import type { Project } from '@/features/projects/schemas/project.schema';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const mockProjects: Project[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'DevBoard Core',
    description: 'Main tracking application',
    status: 'active' as const,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    name: 'Mobile Companion',
    description: 'React Native mobile app',
    status: 'active' as const,
    createdAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-02-01T09:00:00Z',
  },
];

export const projectHandlers = [
  http.get(`${API_URL}/projects`, () => HttpResponse.json(mockProjects)),

  http.post(`${API_URL}/projects`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const now = new Date().toISOString();
    return HttpResponse.json(
      { id: 'a0000000-0000-0000-0000-000000000099', createdAt: now, updatedAt: now, ...body },
      { status: 201 },
    );
  }),

  http.patch(`${API_URL}/projects/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const existing = mockProjects.find((p) => p.id === params.id);
    return HttpResponse.json({
      ...existing,
      ...body,
      id: params.id,
      updatedAt: new Date().toISOString(),
    });
  }),

  http.delete(`${API_URL}/projects/:id`, () => new HttpResponse(null, { status: 204 })),
];
